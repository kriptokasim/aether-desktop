import { PromptProvider } from '@aether/ai/src/prompt/provider';
import { chatToolSet } from '@aether/ai/src/tools';
import {
    ChatSuggestionSchema,
    ChatSummarySchema,
    StreamRequestType,
    type ChatSuggestion,
    type CompletedStreamResponse,
    type PartialStreamResponse,
    type UsageCheckResult,
} from '@aether/models/chat';
import { MainChannels } from '@aether/models/constants';
import {
    generateObject,
    NoSuchToolError,
    RetryError,
    streamText,
    type CoreMessage,
    type CoreSystemMessage,
    type TextStreamPart,
    type ToolSet,
} from 'ai';
import { mainWindow } from '..';
import { z } from 'zod';
import { PersistentStorage } from '../storage';
import {
    AI_PROVIDERS,
    DEFAULT_MODELS,
    FAST_MODELS,
    type AIProviderId,
} from '@aether/models/constants';
import { initModel } from './llmProvider';

class LlmManager {
    private static instance: LlmManager;
    private abortController: AbortController | null = null;
    private useAnalytics: boolean = true;
    private promptProvider: PromptProvider;

    private constructor() {
        this.restoreSettings();
        this.promptProvider = new PromptProvider();
    }

    private restoreSettings() {
        const settings = PersistentStorage.USER_SETTINGS.read() || {};
        const enable = settings.enableAnalytics !== undefined ? settings.enableAnalytics : true;

        if (enable) {
            this.useAnalytics = true;
        } else {
            this.useAnalytics = false;
        }
    }

    public toggleAnalytics(enable: boolean) {
        this.useAnalytics = enable;
    }

    public static getInstance(): LlmManager {
        if (!LlmManager.instance) {
            LlmManager.instance = new LlmManager();
        }
        return LlmManager.instance;
    }

    public async stream(
        messages: CoreMessage[],
        requestType: StreamRequestType,
        options?: {
            abortController?: AbortController;
            skipSystemPrompt?: boolean;
        },
    ): Promise<CompletedStreamResponse> {
        const { abortController, skipSystemPrompt } = options || {};
        this.abortController = abortController || new AbortController();
        try {
            const settings = PersistentStorage.USER_SETTINGS.read();
            const activeProvider =
                (settings?.chat?.provider as AIProviderId) || AI_PROVIDERS.ANTHROPIC;

            if (!skipSystemPrompt) {
                const systemMessage = {
                    role: 'system',
                    content: this.promptProvider.getSystemPrompt(process.platform, activeProvider),
                    experimental_providerMetadata: {
                        anthropic: { cacheControl: { type: 'ephemeral' } },
                    },
                } as CoreSystemMessage;
                messages = [systemMessage, ...messages];
            }
            let selectedModel: string = DEFAULT_MODELS[AI_PROVIDERS.ANTHROPIC];

            if (activeProvider === AI_PROVIDERS.ANTHROPIC) {
                selectedModel =
                    (settings?.chat?.anthropicModel as string) ||
                    DEFAULT_MODELS[AI_PROVIDERS.ANTHROPIC];
            } else if (activeProvider === AI_PROVIDERS.OPENAI) {
                selectedModel =
                    (settings?.chat?.openaiModel as string) || DEFAULT_MODELS[AI_PROVIDERS.OPENAI];
            } else if (activeProvider === AI_PROVIDERS.GEMINI) {
                selectedModel =
                    (settings?.chat?.geminiModel as string) || DEFAULT_MODELS[AI_PROVIDERS.GEMINI];
            }

            const model = await initModel(activeProvider, selectedModel, {
                requestType,
            });

            // Debug logging to understand what's being sent
            console.log('AI Request Config:', {
                provider: activeProvider,
                model: selectedModel,
                messageCount: messages.length,
                hasTools: !!chatToolSet,
                toolCount: Object.keys(chatToolSet).length,
            });

            const { usage, fullStream, text, response } = await streamText({
                model,
                messages,
                abortSignal: this.abortController?.signal,
                maxSteps: 10,
                tools: chatToolSet,
                maxTokens: 64000,
                onStepFinish: ({ toolResults }) => {
                    for (const toolResult of toolResults) {
                        this.emitMessagePart(toolResult);
                    }
                },
                onError: (error) => {
                    throw error;
                },
                experimental_repairToolCall: async ({
                    toolCall,
                    tools,
                    parameterSchema,
                    error,
                }) => {
                    if (NoSuchToolError.isInstance(error)) {
                        console.warn('Invalid tool name', toolCall.toolName, 'attempting to fix');
                        const toolNames = Object.keys(tools).join(', ');

                        // Define schema separately with explicit typing to avoid deep type instantiation
                        const repairSchema = z.object({
                            toolName: z.string(),
                            args: z.record(z.string(), z.unknown()),
                        });

                        // Explicitly type the result to prevent deep type instantiation
                        const repairResult: {
                            object: { toolName: string; args: Record<string, unknown> };
                        } = await generateObject({
                            model,
                            output: 'object',
                            schema: repairSchema,
                            prompt: [
                                `The model tried to call a non-existent tool "${toolCall.toolName}".`,
                                `The available tools are: ${toolNames}.`,
                                `Please determine which valid tool was intended and provide the correct tool name and arguments.`,
                                `Original arguments: ${JSON.stringify(toolCall.args)}`,
                            ].join('\n'),
                        });

                        const repairedToolCall = repairResult.object;

                        if (!repairedToolCall) {
                            throw new Error('Failed to repair tool call: no object returned');
                        }

                        return {
                            toolCallType: 'function' as const,
                            toolCallId: toolCall.toolCallId,
                            toolName: repairedToolCall.toolName,
                            args: repairedToolCall.args as Record<string, unknown>,
                        };
                    }
                    const tool = tools[toolCall.toolName as keyof typeof tools];

                    console.warn(
                        `Invalid parameter for tool ${toolCall.toolName} with args ${JSON.stringify(toolCall.args)}, attempting to fix`,
                    );

                    const { object: repairedArgs } = await generateObject({
                        model,
                        output: 'object',
                        schema: tool.parameters,
                        prompt: [
                            `The model tried to call the tool "${toolCall.toolName}"` +
                                ` with the following arguments:`,
                            JSON.stringify(toolCall.args),
                            `The tool accepts the following schema:`,
                            JSON.stringify(parameterSchema(toolCall)),
                            'Please fix the arguments.',
                        ].join('\n'),
                    });

                    if (!repairedArgs) {
                        throw new Error('Failed to repair tool arguments: no object returned');
                    }

                    return {
                        toolCallType: 'function' as const,
                        toolCallId: toolCall.toolCallId,
                        toolName: toolCall.toolName as string,
                        args: repairedArgs,
                    };
                },
            });
            const streamParts: TextStreamPart<ToolSet>[] = [];
            for await (const partialStream of fullStream) {
                this.emitMessagePart(partialStream);
                streamParts.push(partialStream);
            }
            return {
                payload: (await response).messages,
                type: 'full',
                usage: await usage,
                text: await text,
            };
        } catch (error: any) {
            // Log the full error for debugging
            console.error('LlmManager stream error:', error);

            try {
                // Handle missing config error specifically
                const errorMessage = error.message || '';
                if (
                    errorMessage.includes('Anthropic AI is not configured') ||
                    errorMessage.includes('OpenAI is not configured') ||
                    errorMessage.includes('Gemini is not configured')
                ) {
                    return { message: errorMessage, type: 'error' };
                }

                if (error?.error?.statusCode) {
                    if (error?.error?.statusCode === 403) {
                        const rateLimitError = JSON.parse(
                            error.error.responseBody,
                        ) as UsageCheckResult;
                        return {
                            type: 'rate-limited',
                            rateLimitResult: rateLimitError,
                        };
                    }
                }

                if (RetryError.isInstance(error.error)) {
                    const parsed = JSON.parse(error.error.lastError.responseBody);
                    return { message: parsed.error.message, type: 'error' };
                }

                if (error.error instanceof DOMException) {
                    return { message: 'Request aborted', type: 'error' };
                }

                if ((error as Error).name === 'AbortError') {
                    return { message: 'Request aborted', type: 'error' };
                }

                // Better error message extraction
                const message =
                    error.message ||
                    error.error?.message ||
                    error.toString() ||
                    'An unknown error occurred';

                return { message, type: 'error' };
            } catch (parseError) {
                console.error('Error parsing error', parseError);
                const fallbackMessage =
                    (parseError as Error)?.message ||
                    'An error occurred while processing the request';
                return { message: fallbackMessage, type: 'error' };
            } finally {
                this.abortController?.abort();
                this.abortController = null;
            }
        }
    }

    public abortStream(): boolean {
        if (this.abortController) {
            this.abortController.abort();
            return true;
        }
        return false;
    }

    private emitMessagePart(streamPart: TextStreamPart<ToolSet>) {
        const res: PartialStreamResponse = {
            type: 'partial',
            payload: streamPart,
        };
        mainWindow?.webContents.send(MainChannels.CHAT_STREAM_PARTIAL, res);
    }

    private getActiveProviderAndFastModel(): { provider: AIProviderId; model: string } {
        const settings = PersistentStorage.USER_SETTINGS.read();
        const provider = (settings?.chat?.provider as AIProviderId) ?? AI_PROVIDERS.ANTHROPIC;
        const model = FAST_MODELS[provider] ?? FAST_MODELS[AI_PROVIDERS.ANTHROPIC];
        return { provider, model };
    }

    public async generateSuggestions(messages: CoreMessage[]): Promise<ChatSuggestion[]> {
        try {
            const { provider, model: modelName } = this.getActiveProviderAndFastModel();
            const model = await initModel(provider, modelName, {
                requestType: StreamRequestType.SUGGESTIONS,
            });

            const { object } = await generateObject({
                model,
                output: 'array',
                schema: ChatSuggestionSchema,
                messages,
            });
            return object as ChatSuggestion[];
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    public async generateChatSummary(messages: CoreMessage[]): Promise<string | null> {
        try {
            const { provider, model: modelName } = this.getActiveProviderAndFastModel();
            const model = await initModel(provider, modelName, {
                requestType: StreamRequestType.SUMMARY,
            });

            const systemMessage: CoreSystemMessage = {
                role: 'system',
                content: this.promptProvider.getSummaryPrompt(provider),
                experimental_providerMetadata: {
                    anthropic: { cacheControl: { type: 'ephemeral' } },
                },
            };

            // Transform messages to emphasize they are historical content
            const conversationMessages = messages
                .filter((msg) => msg.role !== 'tool')
                .map((msg) => {
                    const prefix = '[HISTORICAL CONTENT] ';
                    const content =
                        typeof msg.content === 'string' ? prefix + msg.content : msg.content;

                    return {
                        ...msg,
                        content,
                    };
                });

            const { object } = await generateObject({
                model,
                schema: ChatSummarySchema,
                messages: [
                    { role: 'system', content: systemMessage.content as string },
                    ...conversationMessages.map((msg) => ({
                        role: msg.role,
                        content: msg.content as string,
                    })),
                ],
            });

            const {
                filesDiscussed,
                projectContext,
                implementationDetails,
                userPreferences,
                currentStatus,
            } = object as z.infer<typeof ChatSummarySchema>;

            // Formats the structured object into the desired text format
            const summary = `# Files Discussed
${filesDiscussed.join('\n')}

# Project Context
${projectContext}

# Implementation Details
${implementationDetails}

# User Preferences
${userPreferences}

# Current Status
${currentStatus}`;

            return summary;
        } catch (error) {
            console.error('Error generating summary:', error);
            return null;
        }
    }
}

export default LlmManager.getInstance();

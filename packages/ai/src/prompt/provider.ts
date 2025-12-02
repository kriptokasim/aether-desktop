import { AI_PROVIDERS, type AIProviderId } from '@aether/models/constants';
import type {
    ChatMessageContext,
    ErrorMessageContext,
    FileMessageContext,
    HighlightMessageContext,
    ProjectMessageContext,
} from '@aether/models/chat';
import type { CoreUserMessage, ImagePart, UserContent } from 'ai';
import { CONTEXT_PROMPTS } from './context';
import { CREATE_PAGE_EXAMPLE_CONVERSATION, PAGE_SYSTEM_PROMPT } from './create';
import { EDIT_PROMPTS, SEARCH_REPLACE_EXAMPLE_CONVERSATION } from './edit';
import { FENCE } from './format';
import { wrapXml } from './helpers';
import { PLATFORM_SIGNATURE } from './signatures';
import { SUMMARY_PROMPTS } from './summary';

export class PromptProvider {
    constructor() {}

    getSystemPrompt(platform: NodeJS.Platform, provider: AIProviderId = AI_PROVIDERS.ANTHROPIC) {
        let prompt = '';
        const useXml = provider === AI_PROVIDERS.ANTHROPIC;

        if (useXml) {
            prompt += wrapXml('role', EDIT_PROMPTS.system);
            prompt += wrapXml('search-replace-rules', EDIT_PROMPTS.searchReplaceRules);
            prompt += wrapXml(
                'example-conversation',
                this.getExampleConversation(SEARCH_REPLACE_EXAMPLE_CONVERSATION),
            );
        } else {
            prompt += `### Role\n${EDIT_PROMPTS.system}\n\n`;
            prompt += `### Rules\n${EDIT_PROMPTS.searchReplaceRules}\n\n`;
            prompt += `### Example Conversation\n${this.getExampleConversation(SEARCH_REPLACE_EXAMPLE_CONVERSATION)}\n\n`;
        }
        prompt = prompt.replace(PLATFORM_SIGNATURE, platform);
        return prompt;
    }

    getCreatePageSystemPrompt(provider: AIProviderId = AI_PROVIDERS.ANTHROPIC) {
        let prompt = '';
        const useXml = provider === AI_PROVIDERS.ANTHROPIC;

        if (useXml) {
            prompt += wrapXml('role', PAGE_SYSTEM_PROMPT.role);
            prompt += wrapXml('rules', PAGE_SYSTEM_PROMPT.rules);
            prompt += wrapXml(
                'example-conversation',
                this.getExampleConversation(CREATE_PAGE_EXAMPLE_CONVERSATION),
            );
        } else {
            prompt += `### Role\n${PAGE_SYSTEM_PROMPT.role}\n\n`;
            prompt += `### Rules\n${PAGE_SYSTEM_PROMPT.rules}\n\n`;
            prompt += `### Example Conversation\n${this.getExampleConversation(CREATE_PAGE_EXAMPLE_CONVERSATION)}\n\n`;
        }
        return prompt;
    }

    getExampleConversation(
        conversation: {
            role: string;
            content: string;
        }[],
    ) {
        let prompt = '';
        for (const message of conversation) {
            prompt += `${message.role.toUpperCase()}: ${message.content}\n`;
        }
        return prompt;
    }

    getHydratedUserMessage(
        content: UserContent,
        context: ChatMessageContext[],
        provider: AIProviderId = AI_PROVIDERS.ANTHROPIC,
    ): CoreUserMessage {
        if (content.length === 0) {
            throw new Error('Message is required');
        }

        const useXml = provider === AI_PROVIDERS.ANTHROPIC;

        const files = context.filter((c) => c.type === 'file').map((c) => c);
        const highlights = context.filter((c) => c.type === 'highlight').map((c) => c);
        const errors = context.filter((c) => c.type === 'error').map((c) => c);
        const project = context.filter((c) => c.type === 'project').map((c) => c);
        const images = context.filter((c) => c.type === 'image').map((c) => c);

        let prompt = '';
        let contextPrompt = this.getFilesContent(files, highlights, provider);
        if (contextPrompt) {
            if (useXml) {
                contextPrompt = wrapXml('context', contextPrompt);
            }
            prompt += contextPrompt;
        }

        if (errors.length > 0) {
            let errorPrompt = this.getErrorsContent(errors, provider);
            prompt += errorPrompt;
        }

        if (project.length > 0) {
            prompt += this.getProjectContext(project[0], provider);
        }

        if (useXml) {
            const textContent =
                typeof content === 'string'
                    ? content
                    : content
                          .filter((c) => c.type === 'text')
                          .map((c) => c.text)
                          .join('\n');
            prompt += wrapXml('instruction', textContent);
        } else {
            prompt += content;
        }

        const imageParts: ImagePart[] = images.map((i) => ({
            type: 'image',
            image: i.content,
            mimeType: i.mimeType,
        }));

        return {
            role: 'user',
            content: [
                ...imageParts,
                {
                    type: 'text',
                    text: prompt,
                },
            ],
        };
    }

    getFilesContent(
        files: FileMessageContext[],
        highlights: HighlightMessageContext[],
        provider: AIProviderId = AI_PROVIDERS.ANTHROPIC,
    ) {
        if (files.length === 0) {
            return '';
        }
        const useXml = provider === AI_PROVIDERS.ANTHROPIC;
        let prompt = '';
        prompt += `${CONTEXT_PROMPTS.filesContentPrefix}\n`;
        let index = 1;
        for (const file of files) {
            let filePrompt = `${file.path}\n`;
            filePrompt += `${FENCE.code.start}${this.getLanguageFromFilePath(file.path)}\n`;
            filePrompt += file.content;
            filePrompt += `\n${FENCE.code.end}\n`;
            filePrompt += this.getHighlightsContent(file.path, highlights, provider);

            if (useXml) {
                filePrompt = wrapXml(files.length > 1 ? `file-${index}` : 'file', filePrompt);
            }
            prompt += filePrompt;
            index++;
        }

        return prompt;
    }

    getErrorsContent(
        errors: ErrorMessageContext[],
        provider: AIProviderId = AI_PROVIDERS.ANTHROPIC,
    ) {
        if (errors.length === 0) {
            return '';
        }
        const useXml = provider === AI_PROVIDERS.ANTHROPIC;
        let prompt = `${CONTEXT_PROMPTS.errorsContentPrefix}\n`;
        for (const error of errors) {
            prompt += `${error.content}\n`;
        }

        if (prompt.trim().length > 0 && useXml) {
            prompt = wrapXml('errors', prompt);
        }
        return prompt;
    }

    getLanguageFromFilePath(filePath: string): string {
        return filePath.split('.').pop() || '';
    }

    getHighlightsContent(
        filePath: string,
        highlights: HighlightMessageContext[],
        provider: AIProviderId = AI_PROVIDERS.ANTHROPIC,
    ) {
        const fileHighlights = highlights.filter((h) => h.path === filePath);
        if (fileHighlights.length === 0) {
            return '';
        }
        const useXml = provider === AI_PROVIDERS.ANTHROPIC;
        let prompt = `${CONTEXT_PROMPTS.highlightPrefix}\n`;
        let index = 1;
        for (const highlight of fileHighlights) {
            let highlightPrompt = `${filePath}#L${highlight.start}:L${highlight.end}\n`;
            highlightPrompt += `${FENCE.code.start}\n`;
            highlightPrompt += highlight.content;
            highlightPrompt += `\n${FENCE.code.end}\n`;
            if (useXml) {
                highlightPrompt = wrapXml(
                    fileHighlights.length > 1 ? `highlight-${index}` : 'highlight',
                    highlightPrompt,
                );
            }
            prompt += highlightPrompt;
            index++;
        }
        return prompt;
    }

    getSummaryPrompt(provider: AIProviderId = AI_PROVIDERS.ANTHROPIC) {
        let prompt = '';
        const useXml = provider === AI_PROVIDERS.ANTHROPIC;

        if (useXml) {
            prompt += wrapXml('summary-rules', SUMMARY_PROMPTS.rules);
            prompt += wrapXml('summary-guidelines', SUMMARY_PROMPTS.guidelines);
            prompt += wrapXml('summary-format', SUMMARY_PROMPTS.format);
            prompt += wrapXml('summary-reminder', SUMMARY_PROMPTS.reminder);

            prompt += wrapXml('example-conversation', this.getSummaryExampleConversation());
            prompt += wrapXml(
                'example-summary-output',
                'EXAMPLE SUMMARY:\n' + SUMMARY_PROMPTS.summary,
            );
        } else {
            prompt += `### Rules\n${SUMMARY_PROMPTS.rules}\n\n`;
            prompt += `### Guidelines\n${SUMMARY_PROMPTS.guidelines}\n\n`;
            prompt += `### Format\n${SUMMARY_PROMPTS.format}\n\n`;
            prompt += `### Reminder\n${SUMMARY_PROMPTS.reminder}\n\n`;
            prompt += `### Example Conversation\n${this.getSummaryExampleConversation()}\n\n`;
            prompt += `### Example Summary Output\nEXAMPLE SUMMARY:\n${SUMMARY_PROMPTS.summary}\n\n`;
        }

        return prompt;
    }

    getSummaryExampleConversation() {
        let prompt = 'EXAMPLE CONVERSATION:\n';
        for (const message of SEARCH_REPLACE_EXAMPLE_CONVERSATION) {
            prompt += `${message.role.toUpperCase()}: ${message.content}\n`;
        }
        return prompt;
    }

    getProjectContext(
        project: ProjectMessageContext,
        provider: AIProviderId = AI_PROVIDERS.ANTHROPIC,
    ) {
        const content = `${CONTEXT_PROMPTS.projectContextPrefix} ${project.path}`;
        const useXml = provider === AI_PROVIDERS.ANTHROPIC;
        if (useXml) {
            return wrapXml('project-info', content);
        }
        return content;
    }
}

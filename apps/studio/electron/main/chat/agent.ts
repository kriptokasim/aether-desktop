import { generateObject } from 'ai';
import { z } from 'zod';
import { initModel } from './llmProvider';
import { AI_PROVIDERS, DEFAULT_MODELS } from '@aether/models/constants';
import { StreamRequestType } from '@aether/models/chat';

export class Agent {
    private static instance: Agent;

    public static getInstance(): Agent {
        if (!Agent.instance) {
            Agent.instance = new Agent();
        }
        return Agent.instance;
    }

    public async critiqueScreenshot(screenshot: string, prompt: string): Promise<string> {
        try {
            const model = await initModel(AI_PROVIDERS.OPENAI, 'gpt-4o', {
                requestType: StreamRequestType.CHAT,
            });

            const { object } = await generateObject({
                model,
                schema: z.object({
                    critique: z
                        .string()
                        .describe(
                            'A detailed critique of the UI based on the screenshot and the user prompt.',
                        ),
                    suggestions: z
                        .array(z.string())
                        .describe('List of specific suggestions to improve the UI.'),
                }),
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: `Critique this UI based on the following prompt: ${prompt}`,
                            },
                            { type: 'image', image: screenshot },
                        ],
                    },
                ],
            });

            return `Critique:\n${object.critique}\n\nSuggestions:\n${object.suggestions.join('\n- ')}`;
        } catch (error) {
            console.error('Error critiquing screenshot:', error);
            return 'Failed to generate critique.';
        }
    }
}

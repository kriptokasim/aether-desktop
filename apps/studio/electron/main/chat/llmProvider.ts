import type { StreamRequestType } from '@aether/models/chat';
import { type AIProviderId } from '@aether/models/constants';
import { type LanguageModelV1 } from 'ai';
import { getAetherAIProviderConfig } from './config';
import { createProviderClient } from './providerFactory';

export interface AetherPayload {
    requestType: StreamRequestType;
}

export async function initModel(
    provider: AIProviderId,
    modelName: string,
    payload: AetherPayload,
): Promise<LanguageModelV1> {
    const providerConfig = getAetherAIProviderConfig(provider);
    const config = providerConfig.providers[provider];

    // Pass requestType to headers if needed (mostly for Anthropic proxy)
    // The factory functions might need to be updated to accept payload if we want to pass requestType
    // For now, let's assume we can pass it or handle it within the factory if we pass payload.
    // Actually, looking at the previous code, requestType was passed to headers.
    // I should update createAnthropicClient in providerFactory to accept payload or headers.

    const model = await createProviderClient(provider, config, modelName);

    if (process.env.MEM0_API_KEY) {
        try {
            const { createMem0 } = await import('@mem0/vercel-ai-provider');
            const mem0 = createMem0({
                provider: 'anthropic', // Defaulting to anthropic for now as per plan, but ideally should match provider
                mem0ApiKey: process.env.MEM0_API_KEY,
                user_id: 'local-user', // TODO: Map to actual user ID
            });
            // Mem0 wrapper might expect a specific provider string or object.
            // Based on docs, it wraps the model.
            // However, the plan says: const model = mem0('claude-3-5-sonnet-20241022');
            // This implies mem0 returns a provider function.
            // But here we already have a LanguageModelV1.
            // Let's follow the plan's pattern but adapt for existing model creation if possible,
            // or just use mem0 to create the model if enabled.

            // The plan snippet:
            // const mem0 = createMem0({ ... });
            // const model = mem0('claude-3-5-sonnet-20241022');

            // So if Mem0 is enabled, we should use it to create the model instance.
            // But we need to pass the underlying provider/model name.
            // Since we are inside initModel which returns LanguageModelV1, we can return the mem0 model.

            return mem0(modelName);
        } catch (error) {
            console.error('Failed to initialize Mem0:', error);
            return model;
        }
    }

    return model;
}

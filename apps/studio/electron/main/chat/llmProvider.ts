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

    return await createProviderClient(provider, config, modelName);
}

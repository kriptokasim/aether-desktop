import { createAnthropic } from '@ai-sdk/anthropic';
import type { StreamRequestType } from '@onlook/models/chat';
import { BASE_PROXY_ROUTE, FUNCTIONS_ROUTE, ProxyRoutes } from '@onlook/models/constants';
import { CLAUDE_MODELS, LLMProvider } from '@onlook/models/llm';
import { type LanguageModelV1 } from 'ai';
import { getRefreshedAuthTokens } from '../auth';
export interface OnlookPayload {
    requestType: StreamRequestType;
}

export async function initModel(
    provider: LLMProvider,
    model: CLAUDE_MODELS,
    payload: OnlookPayload,
): Promise<LanguageModelV1> {
    switch (provider) {
        case LLMProvider.ANTHROPIC:
            return await getAnthropicProvider(model, payload);
        default:
            throw new Error(`Unsupported provider: ${provider}`);
    }
}

import { getAnthropicConfig } from './config';

async function getAnthropicProvider(
    model: CLAUDE_MODELS,
    payload: OnlookPayload,
): Promise<LanguageModelV1> {
    const config = getAnthropicConfig();

    if (config.source === 'disabled') {
        throw new Error(
            'Anthropic AI is not configured. Please set VITE_ANTHROPIC_API_KEY or VITE_SUPABASE_API_URL.',
        );
    }

    const providerConfig: {
        apiKey?: string;
        baseURL?: string;
        headers?: Record<string, string>;
    } = {};

    if (config.source === 'direct') {
        providerConfig.apiKey = config.apiKey;
    } else if (config.source === 'supabaseProxy') {
        const authTokens = await getRefreshedAuthTokens();
        if (!authTokens) {
            throw new Error('No auth tokens found for Supabase proxy');
        }

        const proxyUrl = `${config.supabaseUrl}${FUNCTIONS_ROUTE}${BASE_PROXY_ROUTE}${ProxyRoutes.ANTHROPIC}`;

        providerConfig.apiKey = '';
        providerConfig.baseURL = proxyUrl;
        providerConfig.headers = {
            Authorization: `Bearer ${authTokens.accessToken}`,
            'X-Onlook-Request-Type': payload.requestType,
            'anthropic-beta': 'output-128k-2025-02-19',
        };
    }

    const anthropic = createAnthropic(providerConfig);
    return anthropic(model, {
        cacheControl: true,
    });
}

import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import {
    BASE_PROXY_ROUTE,
    FUNCTIONS_ROUTE,
    ProxyRoutes,
    AI_PROVIDERS,
    type AIProviderId,
} from '@onlook/models/constants';
import { type LanguageModelV1 } from 'ai';
import { getRefreshedAuthTokens } from '../auth';
import type { AnthropicConfig, AnyProviderConfig, GeminiConfig, OpenAIConfig } from './config';

export interface ProviderClient {
    id: AIProviderId;
    model: LanguageModelV1;
}

export async function createAnthropicClient(
    config: AnthropicConfig,
    modelName: string,
): Promise<any> {
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
            'anthropic-beta': 'output-128k-2025-02-19',
        };
    }

    const anthropic = createAnthropic(providerConfig);
    return anthropic(modelName, {
        cacheControl: true,
    });
}

export async function createOpenAIClient(config: OpenAIConfig, modelName: string): Promise<any> {
    if (config.source === 'disabled') {
        throw new Error('OpenAI is not configured. Please set VITE_OPENAI_API_KEY.');
    }

    const providerConfig: {
        apiKey?: string;
        baseURL?: string;
        headers?: Record<string, string>;
    } = {};

    if (config.source === 'direct') {
        providerConfig.apiKey = config.apiKey;
    } else if (config.source === 'supabaseProxy') {
        // Placeholder for OpenAI proxy logic if needed
        // For now, assume direct or similar proxy structure if implemented
        const authTokens = await getRefreshedAuthTokens();
        if (!authTokens) {
            throw new Error('No auth tokens found for Supabase proxy');
        }
        const proxyUrl = `${config.supabaseUrl}${FUNCTIONS_ROUTE}${BASE_PROXY_ROUTE}${ProxyRoutes.OPENAI}`;

        providerConfig.apiKey = '';
        providerConfig.baseURL = proxyUrl;
        providerConfig.headers = {
            Authorization: `Bearer ${authTokens.accessToken}`,
        };
    }

    const openai = createOpenAI(providerConfig);
    return openai(modelName);
}

export async function createGeminiClient(config: GeminiConfig, modelName: string): Promise<any> {
    if (config.source === 'disabled') {
        throw new Error('Gemini is not configured. Please set VITE_GEMINI_API_KEY.');
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
        const proxyUrl = `${config.supabaseUrl}${FUNCTIONS_ROUTE}${BASE_PROXY_ROUTE}${ProxyRoutes.GEMINI}`;

        providerConfig.apiKey = '';
        providerConfig.baseURL = proxyUrl;
        providerConfig.headers = {
            Authorization: `Bearer ${authTokens.accessToken}`,
        };
    }

    const google = createGoogleGenerativeAI(providerConfig);
    return google(modelName);
}

export async function createProviderClient(
    provider: AIProviderId,
    config: AnyProviderConfig,
    modelName: string,
): Promise<any> {
    switch (provider) {
        case AI_PROVIDERS.ANTHROPIC:
            return createAnthropicClient(config as AnthropicConfig, modelName);
        case AI_PROVIDERS.OPENAI:
            return createOpenAIClient(config as OpenAIConfig, modelName);
        case AI_PROVIDERS.GEMINI:
            return createGeminiClient(config as GeminiConfig, modelName);
        default:
            throw new Error(`Unsupported provider: ${provider}`);
    }
}

import { CLAUDE_MODELS } from '@onlook/models/llm';

export type AIProviderId = 'anthropic' | 'openai' | 'gemini';
export type ProviderSource = 'direct' | 'supabaseProxy' | 'disabled';

export interface ProviderConfigBase {
    id: AIProviderId;
    defaultModel: string;
}

export interface AnthropicConfig extends ProviderConfigBase {
    id: 'anthropic';
    source: ProviderSource;
    apiKey?: string;
    supabaseUrl?: string;
}

export interface OpenAIConfig extends ProviderConfigBase {
    id: 'openai';
    source: ProviderSource;
    apiKey?: string;
    supabaseUrl?: string;
}

export interface GeminiConfig extends ProviderConfigBase {
    id: 'gemini';
    source: ProviderSource;
    apiKey?: string;
    supabaseUrl?: string;
}

export type AnyProviderConfig = AnthropicConfig | OpenAIConfig | GeminiConfig;

export interface AetherAIProviderConfig {
    activeProvider: AIProviderId;
    providers: {
        anthropic: AnthropicConfig;
        openai: OpenAIConfig;
        gemini: GeminiConfig;
    };
}

export function getAnthropicConfig(): AnthropicConfig {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_API_URL;

    let source: ProviderSource = 'disabled';

    if (apiKey && apiKey.length > 0) {
        source = 'direct';
    } else if (supabaseUrl && supabaseUrl.length > 0) {
        source = 'supabaseProxy';
    }

    return {
        id: 'anthropic',
        source,
        apiKey,
        supabaseUrl,
        defaultModel: CLAUDE_MODELS.SONNET_4,
    };
}

export function getOpenAIConfig(): OpenAIConfig {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    // Assuming we might use a proxy for OpenAI too, but for now let's stick to the plan
    // If there's a specific VITE_OPENAI_SUPABASE_URL, use it, otherwise maybe fallback or just keep it simple.
    // The plan mentioned VITE_OPENAI_SUPABASE_URL.
    const supabaseUrl =
        import.meta.env.VITE_OPENAI_SUPABASE_URL || import.meta.env.VITE_SUPABASE_API_URL;

    let source: ProviderSource = 'disabled';

    if (apiKey && apiKey.length > 0) {
        source = 'direct';
    } else if (supabaseUrl && supabaseUrl.length > 0) {
        // Only enable proxy if we actually have a way to proxy OpenAI requests through Supabase
        // For now, let's assume we do if the URL is set, similar to Anthropic
        source = 'supabaseProxy';
    }

    return {
        id: 'openai',
        source,
        apiKey,
        supabaseUrl,
        defaultModel: 'gpt-4o', // Default for now
    };
}

export function getGeminiConfig(): GeminiConfig {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const supabaseUrl =
        import.meta.env.VITE_GEMINI_SUPABASE_URL || import.meta.env.VITE_SUPABASE_API_URL;

    let source: ProviderSource = 'disabled';

    if (apiKey && apiKey.length > 0) {
        source = 'direct';
    } else if (supabaseUrl && supabaseUrl.length > 0) {
        source = 'supabaseProxy';
    }

    return {
        id: 'gemini',
        source,
        apiKey,
        supabaseUrl,
        defaultModel: 'gemini-1.5-flash', // Default for now
    };
}

export function getAetherAIProviderConfig(activeProvider: AIProviderId): AetherAIProviderConfig {
    return {
        activeProvider,
        providers: {
            anthropic: getAnthropicConfig(),
            openai: getOpenAIConfig(),
            gemini: getGeminiConfig(),
        },
    };
}

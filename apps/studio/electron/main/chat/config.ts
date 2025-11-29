import { AI_PROVIDERS, DEFAULT_MODELS, type AIProviderId } from '@onlook/models/constants';

export type { AIProviderId };
export type ProviderSource = 'direct' | 'supabaseProxy' | 'disabled';

export interface ProviderConfigBase {
    id: AIProviderId;
    defaultModel: string;
}

export interface AnthropicConfig extends ProviderConfigBase {
    id: typeof AI_PROVIDERS.ANTHROPIC;
    source: ProviderSource;
    apiKey?: string;
    supabaseUrl?: string;
}

export interface OpenAIConfig extends ProviderConfigBase {
    id: typeof AI_PROVIDERS.OPENAI;
    source: ProviderSource;
    apiKey?: string;
    supabaseUrl?: string;
}

export interface GeminiConfig extends ProviderConfigBase {
    id: typeof AI_PROVIDERS.GEMINI;
    source: ProviderSource;
    apiKey?: string;
    supabaseUrl?: string;
}

export type AnyProviderConfig = AnthropicConfig | OpenAIConfig | GeminiConfig;

export interface AetherAIProviderConfig {
    activeProvider: AIProviderId;
    providers: {
        [AI_PROVIDERS.ANTHROPIC]: AnthropicConfig;
        [AI_PROVIDERS.OPENAI]: OpenAIConfig;
        [AI_PROVIDERS.GEMINI]: GeminiConfig;
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
        id: AI_PROVIDERS.ANTHROPIC,
        source,
        apiKey,
        supabaseUrl,
        defaultModel: DEFAULT_MODELS[AI_PROVIDERS.ANTHROPIC],
    };
}

export function getOpenAIConfig(): OpenAIConfig {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const supabaseUrl =
        import.meta.env.VITE_OPENAI_SUPABASE_URL || import.meta.env.VITE_SUPABASE_API_URL;

    let source: ProviderSource = 'disabled';

    if (apiKey && apiKey.length > 0) {
        source = 'direct';
    } else if (supabaseUrl && supabaseUrl.length > 0) {
        source = 'supabaseProxy';
    }

    return {
        id: AI_PROVIDERS.OPENAI,
        source,
        apiKey,
        supabaseUrl,
        defaultModel: DEFAULT_MODELS[AI_PROVIDERS.OPENAI],
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
        id: AI_PROVIDERS.GEMINI,
        source,
        apiKey,
        supabaseUrl,
        defaultModel: DEFAULT_MODELS[AI_PROVIDERS.GEMINI],
    };
}

export function getAetherAIProviderConfig(activeProvider: AIProviderId): AetherAIProviderConfig {
    return {
        activeProvider,
        providers: {
            [AI_PROVIDERS.ANTHROPIC]: getAnthropicConfig(),
            [AI_PROVIDERS.OPENAI]: getOpenAIConfig(),
            [AI_PROVIDERS.GEMINI]: getGeminiConfig(),
        },
    };
}

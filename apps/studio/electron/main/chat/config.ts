import { CLAUDE_MODELS } from '@onlook/models/llm';

export type AnthropicConfigSource = 'direct' | 'supabaseProxy' | 'disabled';

export interface AnthropicConfig {
    source: AnthropicConfigSource;
    apiKey?: string;
    supabaseUrl?: string;
    defaultModel: string;
}

export function getAnthropicConfig(): AnthropicConfig {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_API_URL;

    let source: AnthropicConfigSource = 'disabled';

    if (apiKey && apiKey.length > 0) {
        source = 'direct';
    } else if (supabaseUrl && supabaseUrl.length > 0) {
        source = 'supabaseProxy';
    }

    return {
        source,
        apiKey,
        supabaseUrl,
        defaultModel: CLAUDE_MODELS.SONNET_4,
    };
}

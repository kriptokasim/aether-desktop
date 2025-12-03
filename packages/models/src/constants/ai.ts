export const AI_PROVIDERS = {
    ANTHROPIC: 'anthropic',
    OPENAI: 'openai',
    GEMINI: 'gemini',
} as const;

export type AIProviderId = (typeof AI_PROVIDERS)[keyof typeof AI_PROVIDERS];

export const DEFAULT_MODELS = {
    [AI_PROVIDERS.ANTHROPIC]: 'claude-opus-4-5-20251101',
    [AI_PROVIDERS.OPENAI]: 'gpt-5.1-2025-11-13',
    [AI_PROVIDERS.GEMINI]: 'gemini-3-pro-preview',
} as const;

export const FAST_MODELS = {
    [AI_PROVIDERS.ANTHROPIC]: 'claude-sonnet-4-20250514',
    [AI_PROVIDERS.OPENAI]: 'gpt-5-mini-2025-08-07',
    [AI_PROVIDERS.GEMINI]: 'gemini-2.5-pro',
} as const;

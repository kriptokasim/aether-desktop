export const AI_PROVIDERS = {
    ANTHROPIC: 'anthropic',
    OPENAI: 'openai',
    GEMINI: 'gemini',
} as const;

export type AIProviderId = (typeof AI_PROVIDERS)[keyof typeof AI_PROVIDERS];

export const DEFAULT_MODELS = {
    [AI_PROVIDERS.ANTHROPIC]: 'claude-3-5-sonnet-20241022',
    [AI_PROVIDERS.OPENAI]: 'gpt-4o',
    [AI_PROVIDERS.GEMINI]: 'gemini-1.5-pro-latest',
} as const;

export const FAST_MODELS = {
    [AI_PROVIDERS.ANTHROPIC]: 'claude-3-haiku-20240307',
    [AI_PROVIDERS.OPENAI]: 'gpt-4o-mini',
    [AI_PROVIDERS.GEMINI]: 'gemini-1.5-flash',
} as const;

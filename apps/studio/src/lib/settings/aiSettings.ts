import { useUserManager } from '@/components/Context';
import { DefaultSettings } from '@onlook/models/constants';
import { CLAUDE_MODELS } from '@onlook/models/llm';
import { observer } from 'mobx-react-lite';

export type AIProviderId = 'anthropic' | 'openai' | 'gemini';

export interface AetherAISettings {
    provider: AIProviderId;
    anthropicModel: string;
    openaiModel: string;
    geminiModel: string;
    autoApplyCode: boolean;
}

export const DEFAULT_AI_PROVIDER: AIProviderId = 'anthropic';
export const DEFAULT_ANTHROPIC_MODEL = CLAUDE_MODELS.SONNET_4;
export const DEFAULT_OPENAI_MODEL = 'gpt-4o';
export const DEFAULT_GEMINI_MODEL = 'gemini-1.5-flash';
export const DEFAULT_AUTO_APPLY_CODE = DefaultSettings.CHAT_SETTINGS.autoApplyCode;

export const useAetherAISettings = () => {
    const userManager = useUserManager();
    const chatSettings = userManager.settings.settings?.chat;

    const settings: AetherAISettings = {
        provider: (chatSettings?.provider as AIProviderId) || DEFAULT_AI_PROVIDER,
        anthropicModel: chatSettings?.anthropicModel || DEFAULT_ANTHROPIC_MODEL,
        openaiModel: chatSettings?.openaiModel || DEFAULT_OPENAI_MODEL,
        geminiModel: chatSettings?.geminiModel || DEFAULT_GEMINI_MODEL,
        autoApplyCode: chatSettings?.autoApplyCode ?? DEFAULT_AUTO_APPLY_CODE,
    };

    const setAetherAISettings = (newSettings: Partial<AetherAISettings>) => {
        userManager.settings.updateChat({
            ...settings,
            ...newSettings,
        });
    };

    return {
        settings,
        setAetherAISettings,
    };
};

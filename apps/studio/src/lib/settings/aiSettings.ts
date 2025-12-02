import { useUserManager } from '@/components/Context';
import {
    DefaultSettings,
    AI_PROVIDERS,
    DEFAULT_MODELS,
    type AIProviderId,
} from '@aether/models/constants';
import { observer } from 'mobx-react-lite';

export interface AetherAISettings {
    provider: AIProviderId;
    anthropicModel: string;
    openaiModel: string;
    geminiModel: string;
    autoApplyCode: boolean;
}

export const DEFAULT_AI_PROVIDER: AIProviderId = AI_PROVIDERS.ANTHROPIC;
export const DEFAULT_ANTHROPIC_MODEL = DEFAULT_MODELS[AI_PROVIDERS.ANTHROPIC];
export const DEFAULT_OPENAI_MODEL = DEFAULT_MODELS[AI_PROVIDERS.OPENAI];
export const DEFAULT_GEMINI_MODEL = DEFAULT_MODELS[AI_PROVIDERS.GEMINI];
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

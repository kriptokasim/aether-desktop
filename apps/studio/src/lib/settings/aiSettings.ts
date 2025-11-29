import { useUserManager } from '@/components/Context';
import { DefaultSettings } from '@onlook/models/constants';
import { CLAUDE_MODELS } from '@onlook/models/llm';
import { observer } from 'mobx-react-lite';

export interface AetherAISettings {
    anthropicModel: string;
    autoApplyCode: boolean;
}

export const DEFAULT_ANTHROPIC_MODEL = CLAUDE_MODELS.SONNET_4;
export const DEFAULT_AUTO_APPLY_CODE = DefaultSettings.CHAT_SETTINGS.autoApplyCode;

export const useAetherAISettings = () => {
    const userManager = useUserManager();
    const chatSettings = userManager.settings.settings?.chat;

    const settings: AetherAISettings = {
        anthropicModel: chatSettings?.anthropicModel || DEFAULT_ANTHROPIC_MODEL,
        autoApplyCode: chatSettings?.autoApplyCode ?? DEFAULT_AUTO_APPLY_CODE,
    };

    const setAetherAISettings = (newSettings: Partial<AetherAISettings>) => {
        userManager.settings.updateChat({
            anthropicModel: newSettings.anthropicModel,
            autoApplyCode: newSettings.autoApplyCode,
        });
    };

    return {
        settings,
        setAetherAISettings,
    };
};

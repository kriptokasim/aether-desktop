import { MainChannels } from '@aether/models/constants';
import type { UserMetadata } from '@aether/models/settings';
import { ipcMain } from 'electron';

export function sendAnalytics(event: string, data?: Record<string, any>) {
    // No-op
}

class Analytics {
    private static instance: Analytics;

    private constructor() {}

    public static getInstance(): Analytics {
        if (!Analytics.instance) {
            Analytics.instance = new Analytics();
        }
        return Analytics.instance;
    }

    public toggleSetting(enable: boolean) {}
    public track(event: string, data?: Record<string, any>, callback?: () => void) {}
    public trackError(message: string, data?: Record<string, any>) {}
    public identify(user: UserMetadata) {}
    public updateUserMetadata(user: Partial<UserMetadata>) {}
    public signOut() {}
}

export default Analytics.getInstance();

import { BASE_PROXY_ROUTE, FUNCTIONS_ROUTE, ProxyRoutes } from '@onlook/models/constants';
import { Client, type SampleFeedbackType } from '@trainloop/sdk';
import type { CoreMessage } from 'ai';
import { getRefreshedAuthTokens } from '../auth';

class TrainLoopManager {
    private static instance: TrainLoopManager;

    private constructor() {}

    async getClient() {
        try {
            const proxyUrl = `${import.meta.env.VITE_SUPABASE_API_URL}${FUNCTIONS_ROUTE}${BASE_PROXY_ROUTE}${ProxyRoutes.TRAINLOOP}`;
            const authTokens = await getRefreshedAuthTokens();
            if (!authTokens) {
                return null;
            }
            return new Client(authTokens.accessToken, proxyUrl);
        } catch (error) {
            // Silently fail if not authenticated - analytics is optional
            console.debug('TrainLoop client not available:', error);
            return null;
        }
    }

    public static getInstance(): TrainLoopManager {
        if (!TrainLoopManager.instance) {
            TrainLoopManager.instance = new TrainLoopManager();
        }
        return TrainLoopManager.instance;
    }

    public async saveApplyResult(messages: CoreMessage[], type: SampleFeedbackType) {
        try {
            const client = await this.getClient();
            if (!client) {
                return; // Silently skip if no client available
            }
            await client.sendData(
                messages as unknown as Record<string, string>[],
                type,
                'onlook-apply-set',
            );
        } catch (error) {
            // Log but don't throw - analytics failures shouldn't break the app
            console.debug('Failed to save apply result to TrainLoop:', error);
        }
    }
}

export default TrainLoopManager.getInstance();

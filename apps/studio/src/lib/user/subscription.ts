import { MainChannels } from '@aether/models/constants';
import { UsagePlanType } from '@aether/models/usage';
import { makeAutoObservable } from 'mobx';
import { invokeMainChannel } from '../utils';

export class SubscriptionManager {
    plan: UsagePlanType = UsagePlanType.BASIC;

    constructor() {
        makeAutoObservable(this);
        this.restoreCachedPlan();
        this.getPlanFromServer();
    }

    private restoreCachedPlan() {
        const cachedPlan = localStorage?.getItem('currentPlan');
        this.plan = (cachedPlan as UsagePlanType) || UsagePlanType.BASIC;
    }

    async updatePlan(plan: UsagePlanType) {
        this.plan = plan;
        localStorage.setItem('currentPlan', plan);
        await invokeMainChannel(MainChannels.UPDATE_USER_METADATA, { plan });
    }

    async getPlanFromServer(): Promise<UsagePlanType> {
        // FORCE PRO PLAN
        return UsagePlanType.PRO;
    }
}

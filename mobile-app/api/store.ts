import client from './client';

export type PlanType = 'subscription' | 'addon';

export type BillingPeriod = 'monthly' | 'yearly' | 'one_time';

export interface PlanLimit {
  _id: string;
  code: string;
  title?: string;
  subtitle?: string;
  type: PlanType;
  price: number;
  billingPeriod: BillingPeriod;
  sortOrder: number;
  isActive: boolean;
  limits?: {
    photosPerContent?: number;
    photosPerAlbum?: number;
    dailyQuiz?: number;
    /** Backend'den number veya MongoDB Long object gelebilir */
    storageBytes?: number | { $numberLong: string };
    videoUpload?: boolean;
    maxVideoDuration?: number;
    adFree?: boolean;
    aiCommentFree?: boolean;
    weeklyReport?: boolean;
    yearlyReport?: boolean;
    allCosmetics?: boolean;
  };
}

export interface StorePlansResponse {
  subscriptions: PlanLimit[];
  addons: PlanLimit[];
}

export const storeApi = {
  getPlans: async (token: string): Promise<StorePlansResponse> => {
    const response = await client.get('/store/plans', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  syncSubscription: async (
    token: string,
    payload: { planCode: string; revenueCatAppUserId?: string },
  ) => {
    const response = await client.post('/store/sync-subscription', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};


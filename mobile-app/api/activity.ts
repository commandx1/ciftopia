import client from './client';

export interface Activity {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: { url: string };
    gender?: string;
  };
  module: string;
  actionType: string;
  description: string;
  createdAt: string;
}

export interface ActivityResponse {
  activities: Activity[];
  total: number;
  hasMore: boolean;
}

export const activityApi = {
  getActivities: async (params: { page: number; limit: number; module?: string }, token?: string) => {
    const response = await client.get<ActivityResponse>('/activity', {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

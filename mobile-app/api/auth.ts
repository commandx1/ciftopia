import client from './client';

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await client.post('/auth/login', { email, password });
    return response.data;
  },
  
  getMe: async (token: string) => {
    const response = await client.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  saveRelationshipProfile: async (data: any, token: string) => {
    const response = await client.post('/auth/relationship-profile', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  registerPushToken: async (pushToken: string, token: string) => {
    const response = await client.post('/auth/push-token', { pushToken }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await client.post('/auth/verify-email', { token });
    return response.data;
  },

  resendVerification: async (email: string) => {
    const response = await client.post('/auth/resend-verification', { email });
    return response.data;
  },

  checkEmail: async (email: string) => {
    const response = await client.get(`/auth/check-email?email=${email}`);
    return response.data;
  },

  updateProfile: async (data: { firstName: string; lastName: string; avatar?: any }, token: string) => {
    const response = await client.post('/auth/update-profile', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  changePassword: async (data: any, token: string) => {
    const response = await client.post('/auth/change-password', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  deleteSite: async (token: string) => {
    const response = await client.delete('/onboarding/site', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};

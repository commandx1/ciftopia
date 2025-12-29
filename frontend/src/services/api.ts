import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

export const authService = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const onboardingService = {
  checkSubdomain: (subdomain: string) => api.get(`/onboarding/check-subdomain?subdomain=${subdomain}`),
  createCouple: (data: any) => api.post('/onboarding/create-couple', data),
};

export const paymentService = {
  processPayment: (data: any) => api.post('/payment/process', data),
};

export default api;


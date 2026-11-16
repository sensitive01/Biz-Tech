import api from './api';

export const authService = {
  login: async (email, password) => {
    return api.post('/api/auth/login', { email, password });
  },

  register: async (userData) => {
    return api.post('/api/auth/register', userData);
  },

  getProfile: async () => {
    return api.get('/api/auth/profile');
  },

  updateProfile: async (profileData) => {
    return api.put('/api/auth/profile', profileData);
  },

  getOnboardingData: async () => {
    return api.get('/api/auth/onboarding-data');
  },

  saveOnboarding: async (onboardingPayload) => {
    return api.post('/api/auth/onboarding', onboardingPayload);
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tenantType');
    localStorage.removeItem('modules');
  },
};

export default authService;


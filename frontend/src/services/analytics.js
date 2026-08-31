import api from './api';

export const analyticsService = {
  async get() {
    const response = await api.get('/analytics');
    return response.data;
  },

  async trackEvent(data) {
    const response = await api.post('/public/analytics', data);
    return response.data;
  },
};

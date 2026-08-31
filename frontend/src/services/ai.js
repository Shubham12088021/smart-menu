import api from './api';

export const aiService = {
  async getStatus() {
    const response = await api.get('/ai/status');
    return response.data;
  },

  async generateDescription(data) {
    const response = await api.post('/ai/description', data);
    return response.data;
  },

  async generateTagline(data) {
    const response = await api.post('/ai/tagline', data);
    return response.data;
  },

  async generateCategoryDescription(data) {
    const response = await api.post('/ai/category-description', data);
    return response.data;
  },
};

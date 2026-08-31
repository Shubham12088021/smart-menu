import api from './api';

export const restaurantService = {
  async get() {
    const response = await api.get('/restaurant');
    return response.data;
  },

  async update(data) {
    const response = await api.put('/restaurant', data);
    return response.data;
  },

  async uploadLogo(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/restaurant/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

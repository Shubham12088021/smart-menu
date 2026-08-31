import api from './api';

export const orderService = {
  async placeOrder(data) {
    const response = await api.post('/orders', data);
    return response.data;
  },

  async getOrders(status = null) {
    const params = status ? { status } : {};
    const response = await api.get('/orders', { params });
    return response.data;
  },

  async getOrder(id) {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  async updateStatus(id, status) {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },
};

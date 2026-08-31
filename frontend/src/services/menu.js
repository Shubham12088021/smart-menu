import api from './api';

export const menuService = {
  // Categories
  async getCategories() {
    const response = await api.get('/categories');
    return response.data;
  },

  async createCategory(data) {
    const response = await api.post('/categories', data);
    return response.data;
  },

  async updateCategory(id, data) {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  async deleteCategory(id) {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  async reorderCategories(orderedIds) {
    const response = await api.put('/categories/reorder/bulk', { ordered_ids: orderedIds });
    return response.data;
  },

  // Menu Items
  async getItems(categoryId = null) {
    const params = categoryId ? { category_id: categoryId } : {};
    const response = await api.get('/menu', { params });
    return response.data;
  },

  async createItem(data) {
    const response = await api.post('/menu', data);
    return response.data;
  },

  async updateItem(id, data) {
    const response = await api.put(`/menu/${id}`, data);
    return response.data;
  },

  async deleteItem(id) {
    const response = await api.delete(`/menu/${id}`);
    return response.data;
  },

  async duplicateItem(id) {
    const response = await api.post(`/menu/${id}/duplicate`);
    return response.data;
  },

  async uploadItemImage(id, file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/menu/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async reorderItems(orderedIds) {
    const response = await api.put('/menu/reorder/bulk', { ordered_ids: orderedIds });
    return response.data;
  },

  // Public menu
  async getPublicMenu(slug) {
    const response = await api.get(`/public/menu/${slug}`);
    return response.data;
  },
};

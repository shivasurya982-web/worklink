import API from './api';

export const categoryService = {
  getAll: () => API.get('/categories'),
  getById: (id) => API.get(`/categories/${id}`),
  create: (data) => API.post('/categories', data),
  update: (id, data) => API.put(`/categories/${id}`, data),
  remove: (id) => API.delete(`/categories/${id}`),
};

export default categoryService;

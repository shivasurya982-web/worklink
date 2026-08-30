import API from './api';

export const workerService = {
  // Public
  getWorkerProfile: (id) => API.get(`/workers/${id}/public`),
  searchWorkers: (params) => API.get('/search/workers', { params }),
  getNearbyWorkers: (params) => API.get('/search/nearby', { params }),

  // Worker Protected
  getMyProfile: () => API.get('/workers/profile'),
  updateProfile: (data) => API.put('/workers/profile', data),
  updateAvailability: (data) => API.patch('/workers/availability', data),
  updateStatus: (data) => API.patch('/workers/status', data),
  getDashboardStats: () => API.get('/workers/dashboard'),
  getPortfolio: () => API.get('/workers/portfolio'),
  addPortfolioItem: (formData) =>
    API.post('/workers/portfolio', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  removePortfolioItem: (id) => API.delete(`/workers/portfolio/${id}`),
};

export default workerService;

import API from './api';

export const adminService = {
  // Dashboard
  getDashboardStats: () => API.get('/admin/dashboard'),

  // Worker Management
  getPendingWorkers: (params) => API.get('/admin/workers/pending', { params }),
  getAllWorkers: (params) => API.get('/admin/workers', { params }),
  approveWorker: (id) => API.patch(`/admin/workers/${id}/approve`),
  rejectWorker: (id, reason) =>
    API.patch(`/admin/workers/${id}/reject`, { reason }),
  suspendWorker: (id) => API.patch(`/admin/workers/${id}/suspend`),
  activateWorker: (id) => API.patch(`/admin/workers/${id}/activate`),

  // Customer Management
  getAllCustomers: (params) => API.get('/admin/customers', { params }),
  suspendCustomer: (id) => API.patch(`/admin/customers/${id}/suspend`),
  activateCustomer: (id) => API.patch(`/admin/customers/${id}/activate`),

  // Booking Management
  getAllBookings: (params) => API.get('/admin/bookings', { params }),

  // Analytics
  getAnalytics: () => API.get('/analytics/admin'),
  getWorkerAnalytics: () => API.get('/analytics/worker'),
};

export default adminService;

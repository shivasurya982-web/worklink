import API from './api';

export const bookingService = {
  // Customer
  createBooking: (data) => API.post('/bookings', data),
  getMyBookings: (params) => API.get('/bookings/customer', { params }),
  cancelBooking: (id, reason) => API.patch(`/bookings/${id}/cancel`, { reason }),

  // Worker
  getWorkerBookings: (params) => API.get('/bookings/worker', { params }),
  acceptBooking: (id) => API.patch(`/bookings/${id}/accept`),
  rejectBooking: (id, reason) => API.patch(`/bookings/${id}/reject`, { reason }),
  startBooking: (id) => API.patch(`/bookings/${id}/start`),
  completeBooking: (id) => API.patch(`/bookings/${id}/complete`),
  updateOnTheWay: (id) => API.patch(`/bookings/${id}/on-the-way`),

  // Common
  getBookingById: (id) => API.get(`/bookings/${id}`),
};

export default bookingService;

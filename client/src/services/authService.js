import API from './api';

export const authService = {
  // Customer Auth
  registerCustomer: (data) => API.post('/auth/customer/register', data),
  loginCustomer: (data) => API.post('/auth/customer/login', data),

  // Worker Auth
  registerWorker: (data) =>
    data instanceof FormData
      ? API.post('/auth/worker/register', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      : API.post('/auth/worker/register', data),
  loginWorker: (data) => API.post('/auth/worker/login', data),

  // Admin Auth
  loginAdmin: (data) => API.post('/auth/admin/login', data),

  // Common
  // Register Hint Password Recovery
  checkAccount: (data) => API.post('/auth/check-account', data),
  verifyRegisterHint: (data) => API.post('/auth/verify-hint', data),
  resetPasswordWithHint: (data) => API.post('/auth/reset-password-hint', data),
  changePassword: (data) => API.put('/auth/change-password', data),
};

export default authService;

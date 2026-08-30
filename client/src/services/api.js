import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('worklink_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle errors globally
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';

    if (error.response?.status === 401) {
      // Clear token on unauthorized if not on auth pages
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('worklink_token');
        localStorage.removeItem('worklink_user');
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default API;

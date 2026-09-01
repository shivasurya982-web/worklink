import axios from 'axios';

const API = axios.create({
  // Always use relative /api in development to leverage Vite proxy
  // Use environment variable only if explicitly defined (e.g. in production)
  baseURL: import.meta.env.PROD && import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('worklyn_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
       // Log only in dev to help debugging
       if (import.meta.env.DEV) {
         console.warn('[API] No token found in localStorage for request:', config.url);
       }
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

    // If unauthorized, clear local storage and redirect to login
    if (error.response?.status === 401) {
      const isLoginPage = window.location.pathname.includes('/login');
      const isRegisterPage = window.location.pathname.includes('/register');

      if (!isLoginPage && !isRegisterPage) {
        console.error('[API] Unauthorized access. Clearing session and redirecting.');
        localStorage.removeItem('worklyn_token');
        localStorage.removeItem('worklyn_user');

        // Only redirect if we're not already trying to login
        window.location.href = '/login?expired=true';
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default API;

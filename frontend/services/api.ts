import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for httpOnly cookies
});

// Request interceptor: Attach accessToken from Zustand memory and Log Request
api.interceptors.request.use(
  (config) => {
    // Monitoring log
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      headers: config.headers,
    });

    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error(`[API Request Error]`, error);
    return Promise.reject(error);
  }
);

// Response interceptor: Handle 401 and Log Response
api.interceptors.response.use(
  (response) => {
    // Monitoring log
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    console.error(`[API Response Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      status: error.response?.status,
      data: error.response?.data,
    });

    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn('[API Auth] 401 Unauthorized detected. Attempting token refresh...');
      originalRequest._retry = true;

      try {
        // Call refresh endpoint - will use httpOnly refreshToken cookie automatically
        const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true });
        const { accessToken } = response.data;

        console.info('[API Auth] Token refresh successful.');

        // Update store with new accessToken
        useAuthStore.getState().setAccessToken(accessToken);

        // Update header and retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('[API Auth] Refresh token expired or invalid. Logging out...');
        // If refresh fails, logout user
        useAuthStore.getState().logout();
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

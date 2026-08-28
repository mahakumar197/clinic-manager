import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from './endpoints';
import { handleApiError } from './errorHandler';
import { API_TIMEOUT } from '@/constants';

let store: any;

export const injectStore = (_store: any) => {
  store = _store;
};

/**
 * Create and configure Axios instance with interceptors
 */

// Create Axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token to requests if available
    if (store) {
      const { accessToken } = store.getState().auth;
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    // TEST: Force expired token to test refresh logic (DEV ONLY)
    // if (
    //   import.meta.env.DEV &&
    //   !(config as any)._retry &&
    //   !config.url?.includes("/auth/refresh")
    // ) {
    //   config.headers.Authorization = "Bearer force-expired-token";
    // }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (!store) {
          // If store is not injected yet, we can't refresh.
          return Promise.reject(error);
        }

        // Try to refresh the token
        const { refreshToken } = store.getState().auth;

        if (refreshToken) {
          // Call refresh endpoint using default axios (no interceptors)
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          

          const { accessToken } = response.data.data; // Response structure is { success: true, data: { accessToken: ... } } based on authService

          // Update store with new token
          store.dispatch({
            type: 'auth/updateTokens',
            payload: { accessToken }
          });

          // Update header for the original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          // Update default header for future requests (optional, but store sync handles it via request interceptor)
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

          // Retry the original request
          return axiosInstance(originalRequest);
        } else {
          throw new Error(error?.response?.data?.message || 'No refresh token available');
        }
      } catch (refreshError) {
        // Logout if refresh fails
        if (store) {
          // Dispatch logout fulfilled to clear state
          // We use the string type to avoid circular dependency imports
          store.dispatch({ type: 'auth/logout/fulfilled' });
        }
        return Promise.reject(refreshError);
      }
    }

    // Transform error using error handler
    const handledError = handleApiError(error);

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', handledError);
    }

    return Promise.reject(handledError);
  }
);

export default axiosInstance;

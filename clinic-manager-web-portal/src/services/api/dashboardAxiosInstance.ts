import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { store } from "@/app/store";
import { API_BASE_URL, MAIN_API_BASE_URL } from "./endpoints";
import { API_TIMEOUT } from "@/constants";

/**
 * Axios instance for Dashboard-related APIs (2092)
 */
const dashboardAxiosInstance: AxiosInstance = axios.create({
  baseURL: MAIN_API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ======================================================
 * REQUEST INTERCEPTOR
 * ====================================================== */
dashboardAxiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig & { __isRetryRequest?: boolean }) => {
    const { accessToken } = store.getState()?.auth;

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // DEV ONLY – force 401 to test refresh (optional)
    // if (
    //   import.meta.env.DEV &&
    //   !config.__isRetryRequest &&
    //   !config.url?.includes("/auth/refresh")
    // ) {
    //   config.headers.Authorization = "Bearer force-expired-token";
    // }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ======================================================
 * RESPONSE INTERCEPTOR (REFRESH LOGIC)
 * ====================================================== */
dashboardAxiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      __isRetryRequest?: boolean;
    };

    if (
      error.response?.status === 401 &&
      !originalRequest.__isRetryRequest &&
      !originalRequest.url?.includes("auth/refresh")
    ) {
      originalRequest.__isRetryRequest = true;

      try {
        const { refreshToken } = store.getState().auth;

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        //  Use plain axios to avoid interceptor loop
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken } = refreshResponse?.data?.data;

        // Update redux
        store.dispatch({
          type: "auth/updateTokens",
          payload: { accessToken },
        });

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return dashboardAxiosInstance(originalRequest);
      } catch (refreshError) {
        store.dispatch({ type: "auth/logout/fulfilled" });

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default dashboardAxiosInstance;

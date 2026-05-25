// src/lib/api.ts
// Axios instance with base URL, auth headers, and token refresh interceptor

import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // send httpOnly refresh token cookie
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

// Request interceptor — attach access token from memory
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Token is read from authStore at request time (lazy read — avoids stale closure)
  // Import is dynamic to avoid circular dependency
  const token =
    typeof window !== 'undefined'
      ? (window as Window & { __accessToken?: string }).__accessToken
      : undefined;

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor — auto refresh on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null): void {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!(error instanceof AxiosError)) return Promise.reject(error);

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${String(token)}`;
          }
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post<{ data: { accessToken: string } }>(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        const newToken = data.data.accessToken;
        (window as Window & { __accessToken?: string }).__accessToken = newToken;
        processQueue(null, newToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear token and redirect to login
        (window as Window & { __accessToken?: string }).__accessToken = undefined;
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export function parseApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? error.message ?? 'Xəta baş verdi';
  }
  if (error instanceof Error) return error.message;
  return 'Xəta baş verdi';
}

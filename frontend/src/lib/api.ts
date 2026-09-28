/**
 * Central Axios instance.
 *
 * Responsibilities:
 *  - attach the Bearer access token to every request;
 *  - transparently refresh the access token on a 401 (single-flight, so a burst
 *    of parallel 401s triggers exactly one refresh call), then replay the
 *    original requests;
 *  - normalise the backend `ApiResponse<T>` envelope so callers get `T`
 *    directly and thrown errors carry a friendly `.message`.
 */

import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { API_BASE_URL } from './constants';
import { tokenStore } from './tokenStore';
import type { ApiResponse, AuthResponse } from '@/types';

/** Raised for any non-2xx response; `.message` is safe to surface in the UI. */
export class ApiError extends Error {
  status: number;
  errors?: unknown;

  constructor(message: string, status: number, errors?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

/** Invoked when refresh fails / no session remains, so the app can log out. */
let onAuthFailure: (() => void) | null = null;
export function setAuthFailureHandler(handler: () => void): void {
  onAuthFailure = handler;
}

export const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  // 25s is generous for report/PDF generation without hanging the UI forever.
  timeout: 25_000,
});

/* ----------------------------- request side ----------------------------- */

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.getAccessToken();
  if (token) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

/* ----------------------------- refresh flow ----------------------------- */

let refreshPromise: Promise<string> | null = null;

/** Perform the refresh call outside the interceptor to avoid recursion. */
async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStore.getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token');

  // Bare axios (not `http`) so this request skips the auth interceptors.
  const { data } = await axios.post<ApiResponse<AuthResponse>>(
    `${API_BASE_URL}/auth/refresh`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' } },
  );

  const payload = data?.data;
  if (!payload?.accessToken || !payload?.refreshToken) {
    throw new Error('Malformed refresh response');
  }
  tokenStore.setTokens(payload.accessToken, payload.refreshToken);
  return payload.accessToken;
}

/* ----------------------------- response side ---------------------------- */

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const status = error.response?.status;
    const isRefreshCall = original?.url?.includes('/auth/refresh');

    // Attempt one transparent refresh on 401 (never for the refresh call itself).
    if (status === 401 && original && !original._retry && !isRefreshCall) {
      original._retry = true;
      try {
        refreshPromise = refreshPromise ?? refreshAccessToken();
        const newToken = await refreshPromise;
        refreshPromise = null;

        const headers = AxiosHeaders.from(original.headers);
        headers.set('Authorization', `Bearer ${newToken}`);
        original.headers = headers;
        return http(original);
      } catch (refreshErr) {
        refreshPromise = null;
        tokenStore.clear();
        onAuthFailure?.();
        return Promise.reject(
          new ApiError('Your session has expired. Please sign in again.', 401),
        );
      }
    }

    // Normalise everything else into an ApiError with a friendly message.
    const body = error.response?.data;
    const message =
      body?.message ||
      (status === 403
        ? 'You do not have permission to perform this action.'
        : status === 404
          ? 'The requested resource was not found.'
          : error.message || 'Something went wrong. Please try again.');

    return Promise.reject(new ApiError(message, status ?? 0, body?.errors));
  },
);

/* --------------------------- typed convenience -------------------------- */

/** Unwrap `ApiResponse<T>` → `T`, throwing an ApiError when `success` is false. */
function unwrap<T>(body: ApiResponse<T>): T {
  if (body && body.success === false) {
    throw new ApiError(body.message || 'Request failed', 0, body.errors);
  }
  return body?.data as T;
}

export const api = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await http.get<ApiResponse<T>>(url, config);
    return unwrap<T>(data);
  },
  async post<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await http.post<ApiResponse<T>>(url, body, config);
    return unwrap<T>(data);
  },
  async put<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await http.put<ApiResponse<T>>(url, body, config);
    return unwrap<T>(data);
  },
  async patch<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await http.patch<ApiResponse<T>>(url, body, config);
    return unwrap<T>(data);
  },
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await http.delete<ApiResponse<T>>(url, config);
    return unwrap<T>(data);
  },
  /**
   * Multipart upload. Passing a FormData body with an explicit multipart Content-Type lets
   * axios append the boundary itself; we override the instance-wide JSON default per call.
   */
  async postForm<T>(url: string, form: FormData, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await http.post<ApiResponse<T>>(url, form, {
      ...config,
      headers: { ...config?.headers, 'Content-Type': 'multipart/form-data' },
    });
    return unwrap<T>(data);
  },
  /** For binary downloads (PDF certificate, XLSX report). Returns the raw Blob. */
  async getBlob(url: string, config?: AxiosRequestConfig): Promise<Blob> {
    const { data } = await http.get<Blob>(url, { ...config, responseType: 'blob' });
    return data;
  },
};

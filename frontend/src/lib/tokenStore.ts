/**
 * Small wrapper around the browser token store.
 *
 * The access + refresh JWTs are per-user runtime credentials (not build-time
 * secrets), so keeping them here is safe with respect to the "never expose
 * secrets in frontend code" rule. They are read/written only through this
 * module so the storage mechanism can be swapped in one place (e.g. moved to
 * httpOnly cookies) without touching the rest of the app.
 */

import { STORAGE_KEYS } from './constants';

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage may be unavailable (private mode / SSR) — fail soft */
  }
}

function safeRemove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export const tokenStore = {
  getAccessToken: (): string | null => safeGet(STORAGE_KEYS.accessToken),
  getRefreshToken: (): string | null => safeGet(STORAGE_KEYS.refreshToken),

  setTokens(accessToken: string, refreshToken: string): void {
    safeSet(STORAGE_KEYS.accessToken, accessToken);
    safeSet(STORAGE_KEYS.refreshToken, refreshToken);
  },

  clear(): void {
    safeRemove(STORAGE_KEYS.accessToken);
    safeRemove(STORAGE_KEYS.refreshToken);
  },
};

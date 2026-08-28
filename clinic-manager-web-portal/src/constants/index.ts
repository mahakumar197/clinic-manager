/**
 * Application constants
 */

export * from './routes';

export const APP_NAME = 'Paalmall';
export const APP_VERSION = '1.0.0';

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// API
export const API_TIMEOUT = 30000; // 30 seconds

// LocalStorage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  THEME_MODE: 'theme_mode',
} as const;

// Date formats (dayjs-compatible tokens)
export const DATE_FORMATS = {
  DATE: 'DD-MM-YYYY',            // e.g. 27-02-2026
  DATE_TIME: 'DD-MM-YYYY HH:mm', // e.g. 27-02-2026 14:30
  TIME: 'HH:mm',                 // e.g. 14:30
} as const;

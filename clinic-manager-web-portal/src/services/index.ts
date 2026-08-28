/**
 * Service layer barrel export
 * Central export point for all API services
 */

export { default as authService } from './modules/auth.service';
export { default as userService } from './modules/user.service';
export { default as axiosInstance } from './api/axiosInstance';
export * from './api/endpoints';
export {
  ApiError,
  NetworkError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  handleApiError,
  getErrorMessage,
} from './api/errorHandler';
export * from './types';

import { AxiosError } from 'axios';

/**
 * Custom error classes for different error types
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApiError {
  constructor(message = 'Access denied') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

export class ValidationError extends ApiError {
  constructor(
    message = 'Validation failed',
    public errors?: Record<string, string[]>
  ) {
    super(message, 422);
    this.name = 'ValidationError';
  }
}

/**
 * Handle API errors and transform them into appropriate error types
 */
export const handleApiError = (error: unknown): Error => {
  if (error instanceof AxiosError) {
    const { response, request, message } = error;

    // Network error (no response received)
    if (!response && request) {
      return new NetworkError('Network error. Please check your connection.');
    }

    // Server responded with error status
    if (response) {
      const { status, data } = response;
      const errorMessage = data?.message || data?.error || 'An error occurred';

      switch (status) {
        case 400:
          return new ApiError(errorMessage, status, data);
        case 401:
          return new AuthenticationError(errorMessage);
        case 403:
          return new AuthorizationError(errorMessage);
        case 404:
          return new ApiError('Resource not found', status, data);
        case 422:
          return new ValidationError(errorMessage, data?.errors);
        case 500:
          return new ApiError('Internal server error', status, data);
        default:
          return new ApiError(errorMessage, status, data);
      }
    }

    // Request was made but no response
    return new NetworkError(message);
  }

  // Unknown error type
  if (error instanceof Error) {
    return error;
  }

  return new Error('An unknown error occurred');
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error: unknown): string => {
  const handledError = handleApiError(error);
  return handledError.message;
};

// API Versioning
export enum ApiVersion {
  V1 = 'v1',
  V2 = 'v2',
}

// HTTP Status Codes
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

// Pagination Interface
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Links for HATEOAS
export interface ApiLinks {
  self?: string;
  next?: string;
  prev?: string;
  first?: string;
  last?: string;
}

// Error Details Interface
export interface ErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

// Standardized Error Response
export interface ApiError {
  code: string;
  message: string;
  details?: ErrorDetail[];
  timestamp: string;
  path?: string;
  requestId?: string;
  stack?: string; // Only in development
}

// Metadata Interface
export interface ApiMetadata {
  version: ApiVersion;
  timestamp: string;
  requestId: string;
  executionTime?: number;
  pagination?: PaginationMeta;
  links?: ApiLinks;
  count?: object;
}

// Main API Response Interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
  meta: ApiMetadata;
  statusCode: HttpStatus;
}

// Paginated Response Interface
export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  meta: ApiMetadata & {
    pagination: PaginationMeta;
    links?: ApiLinks;
  };
}

// Success Response Factory
export interface SuccessResponse<T = any> {
  data: T;
  message?: string;
  statusCode?: HttpStatus;
}

// Error Response Factory
export interface ErrorResponse {
  code: string;
  message: string;
  details?: ErrorDetail[];
  statusCode: HttpStatus;
  stack?: string;
}

// API Response Builder Class
export class ApiResponseBuilder {
  private response: Partial<ApiResponse>;

  constructor(version: ApiVersion = ApiVersion.V1) {
    this.response = {
      success: true,
      meta: {
        version,
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
      },
    };
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  success<T>(
    data: T,
    message?: string,
    statusCode: HttpStatus = HttpStatus.OK,
  ): ApiResponse<T> {
    this.response.success = true;
    this.response.statusCode = statusCode;
    this.response.data = data;
    this.response.message = message;
    this.response.error = undefined;
    return this.response as ApiResponse<T>;
  }

  error(
    error: ApiError,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ): ApiResponse<null> {
    this.response.success = false;
    this.response.data = undefined;
    this.response.error = error;
    return this.response as ApiResponse<null>;
  }

  paginated<T>(
    data: T[],
    pagination: PaginationMeta,
    message?: string,
    links?: ApiLinks,
  ): PaginatedApiResponse<T> {
    this.response.success = true;
    this.response.data = data;
    this.response.message = message;
    this.response.error = undefined;

    if (this.response.meta) {
      this.response.meta.pagination = pagination;
      this.response.meta.links = links;
    }

    return this.response as PaginatedApiResponse<T>;
  }

  withExecutionTime(ms: number): this {
    if (this.response.meta) {
      this.response.meta.executionTime = ms;
    }
    return this;
  }

  withRequestId(requestId: string): this {
    if (this.response.meta) {
      this.response.meta.requestId = requestId;
    }
    return this;
  }
}

// Common Error Codes
export enum ErrorCode {
  // Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  REQUIRED_FIELD_MISSING = 'REQUIRED_FIELD_MISSING',
  INVALID_FORMAT = 'INVALID_FORMAT',

  // Authentication Errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',

  // Authorization Errors
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Resource Errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',

  // Business Logic Errors
  INVALID_OPERATION = 'INVALID_OPERATION',
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',

  // System Errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

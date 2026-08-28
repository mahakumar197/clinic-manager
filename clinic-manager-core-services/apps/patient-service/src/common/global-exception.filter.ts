import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ApiError, ErrorCode, ErrorDetail } from '@pallmall/shared-types';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let apiError: ApiError;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();

      if (
        exception instanceof BadRequestException &&
        this.isValidationError(errorResponse)
      ) {
        apiError = this.handleValidationError(errorResponse, request.url);
      } else {
        apiError = this.handleHttpException(exception, request.url);
      }
    } else if (exception instanceof Error) {
      apiError = this.handleGenericError(exception, request.url);
    } else {
      apiError = this.handleUnknownError(request.url);
    }

    // Add request ID if available
    const requestId =
      request.headers['x-request-id'] ||
      request.headers['x-correlation-id'] ||
      `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    apiError.requestId = requestId;

    // Set security headers
    response.setHeader('X-Request-ID', requestId);
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('X-XSS-Protection', '1; mode=block');

    response.status(status).json({
      success: false,
      error: apiError,
      meta: {
        version: 'v1',
        timestamp: new Date().toISOString(),
        requestId,
      },
    });
  }

  private isValidationError(errorResponse: any): boolean {
    return (
      typeof errorResponse === 'object' &&
      errorResponse !== null &&
      'message' in errorResponse &&
      Array.isArray(errorResponse.message) &&
      errorResponse.message.some(
        (msg: any) => typeof msg === 'object' && 'constraints' in msg,
      )
    );
  }

  private handleValidationError(errorResponse: any, path: string): ApiError {
    const validationErrors = errorResponse.message as ValidationError[];
    const details: ErrorDetail[] = [];

    validationErrors.forEach((error) => {
      if (error.constraints) {
        Object.entries(error.constraints).forEach(([constraint, message]) => {
          details.push({
            field: error.property,
            message,
            code: constraint.toUpperCase(),
          });
        });
      }
    });

    return {
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Validation failed',
      details,
      timestamp: new Date().toISOString(),
      path,
    };
  }

  private handleHttpException(
    exception: HttpException,
    path: string,
  ): ApiError {
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    let message = 'An error occurred';
    let code = ErrorCode.INTERNAL_ERROR;

    if (typeof errorResponse === 'object' && errorResponse !== null) {
      const errorObj = errorResponse as any;
      message = errorObj.message || message;

      if (errorObj.code) {
        code = errorObj.code;
      } else {
        code = this.mapHttpStatusToErrorCode(status);
      }
    } else if (typeof errorResponse === 'string') {
      message = errorResponse;
      code = this.mapHttpStatusToErrorCode(status);
    }

    return {
      code,
      message,
      timestamp: new Date().toISOString(),
      path,
    };
  }

  private handleGenericError(error: Error, path: string): ApiError {
    return {
      code: ErrorCode.INTERNAL_ERROR,
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      path,
    };
  }

  private handleUnknownError(path: string): ApiError {
    return {
      code: ErrorCode.INTERNAL_ERROR,
      message: 'An unknown error occurred',
      timestamp: new Date().toISOString(),
      path,
    };
  }

  private mapHttpStatusToErrorCode(status: number): ErrorCode {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.VALIDATION_ERROR;
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ErrorCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ErrorCode.NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ErrorCode.CONFLICT;
      default:
        return ErrorCode.INTERNAL_ERROR;
    }
  }
}

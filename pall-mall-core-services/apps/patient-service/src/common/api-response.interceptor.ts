import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  ApiResponse,
  ApiResponseBuilder,
  ApiError,
  ErrorCode,
  HttpStatus as ApiHttpStatus,
  PaginationMeta,
} from '@pallmall/shared-types';

@Injectable()
export class ApiResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const builder = new ApiResponseBuilder();
    const startTime = Date.now();

    // Add request ID to response headers
    const requestId = builder['generateRequestId']();
    response.setHeader('X-Request-ID', requestId);
    response.setHeader('X-API-Version', 'v1');

    return next.handle().pipe(
      map((data) => {
        const executionTime = Date.now() - startTime;

        // Check if data is a paginated result
        if (
          data &&
          typeof data === 'object' &&
          'data' in data &&
          'total' in data &&
          'page' in data
        ) {
          const paginatedData = data as any;
          const pagination: PaginationMeta = {
            page: paginatedData.page,
            limit: paginatedData.limit,
            total: paginatedData.total,
            totalPages:
              paginatedData.totalPages ||
              Math.ceil(paginatedData.total / paginatedData.limit),
            hasNext:
              paginatedData.page <
              (paginatedData.totalPages ||
                Math.ceil(paginatedData.total / paginatedData.limit)),
            hasPrev: paginatedData.page > 1,
          };

          return builder
            .withExecutionTime(executionTime)
            .withRequestId(requestId)
            .paginated(
              paginatedData.data,
              pagination,
              'Data retrieved successfully',
            );
        }

        // Standardize successful responses
        return builder
          .withExecutionTime(executionTime)
          .withRequestId(requestId)
          .success(data);
      }),
      catchError((error) => {
        const executionTime = Date.now() - startTime;

        let apiError: ApiError;
        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

        if (error instanceof HttpException) {
          statusCode = error.getStatus();
          const errorResponse = error.getResponse();

          if (typeof errorResponse === 'object' && errorResponse !== null) {
            const errorObj = errorResponse as any;
            apiError = {
              code: errorObj.code || this.mapHttpStatusToErrorCode(statusCode),
              message: errorObj.message || error.message,
              details: errorObj.details || errorObj.errors,
              timestamp: new Date().toISOString(),
              path:
                process.env.NODE_ENV === 'development'
                  ? request.url
                  : undefined,
              requestId,
            };
          } else {
            apiError = {
              code: this.mapHttpStatusToErrorCode(statusCode),
              message:
                typeof errorResponse === 'string'
                  ? errorResponse
                  : error.message,
              timestamp: new Date().toISOString(),
              path:
                process.env.NODE_ENV === 'development'
                  ? request.url
                  : undefined,
              requestId,
            };
          }
        } else {
          apiError = {
            code: ErrorCode.INTERNAL_ERROR,
            message: 'An unexpected error occurred',
            timestamp: new Date().toISOString(),
            path:
              process.env.NODE_ENV === 'development' ? request.url : undefined,
            requestId,
          };
        }

        response.status(statusCode);

        return throwError(() =>
          builder
            .withExecutionTime(executionTime)
            .withRequestId(requestId)
            .error(apiError, statusCode as ApiHttpStatus),
        );
      }),
    );
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

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('GlobalExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = null;

    // Handle HTTP exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        errors = (exceptionResponse as any).errors || null;
      } else {
        message = exceptionResponse as string;
      }
    }
    // Handle TypeORM query errors
    else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Database query failed';

      // Check for specific database errors
      const error = exception as any;
      if (error.code === '23505') {
        message = 'Duplicate entry - record already exists';
      } else if (error.code === '23503') {
        message = 'Foreign key constraint violation';
      } else if (error.code === '23502') {
        message = 'Required field is missing';
      }
    }
    // Handle validation errors
    else if (exception instanceof Error) {
      message = exception.message;

      // Log the full error for debugging
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
      );
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: process.env.NODE_ENV === 'development' ? request.url : undefined,
      method: request.method,
      message,
      ...(errors && { errors }),
    };

    // Log error
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Message: ${message}`,
    );

    response.status(status).json(errorResponse);
  }
}

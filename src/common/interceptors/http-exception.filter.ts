import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponseDto } from '../dto/api-response.dto';

/**
 * HTTP Exception Filter
 * Catches all exceptions and transforms them into our standardized error response format
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Get status code and error message
    let statusCode: number;
    let message: string;
    let errorDetails: any = null;

    if (exception instanceof HttpException) {
      // Handle NestJS HTTP exceptions
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        message = exceptionResponse['message'] || exception.message;
        errorDetails = exceptionResponse['error'] || null;

        // Handle validation errors (array of error messages)
        if (Array.isArray(message)) {
          errorDetails = { validationErrors: message };
          message = 'Validation failed';
        }
      } else {
        message = exception.message;
      }
    } else {
      // Handle other exceptions (internal server errors)
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';

      // In development, include the actual error message
      if (process.env.NODE_ENV !== 'production') {
        errorDetails = {
          name: exception.name,
          message: exception.message,
          stack: exception.stack,
        };
      }
    }

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} - ${statusCode} - ${message}`,
      exception.stack,
    );

    // Send standardized error response
    const errorResponse = ApiResponseDto.error(
      statusCode,
      message,
      errorDetails,
    );

    response.status(statusCode).json(errorResponse);
  }
} 
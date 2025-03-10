import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponseDto } from '../dto/api-response.dto';

/**
 * Response Interceptor
 * Transforms all responses to a standardized format using ApiResponseDto
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponseDto<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponseDto<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode || HttpStatus.OK;

    return next.handle().pipe(
      map((data) => {
        // If the response is already in our ApiResponseDto format, return it as is
        if (data instanceof ApiResponseDto) {
          return data;
        }

        // If the data is an object with a message property, use it
        const message = data?.message || 'Success';

        // Remove message from data if it exists to avoid duplication
        if (data?.message) {
          const { message, ...rest } = data;
          return ApiResponseDto.success(statusCode, message, rest);
        }

        // Otherwise, create a standard success response
        return ApiResponseDto.success(statusCode, message, data);
      }),
    );
  }
} 
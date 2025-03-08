/**
 * Standard API Response DTO
 * This class defines the structure for all API responses in the application
 */
export class ApiResponseDto<T> {
  /**
   * Indicates whether the request was successful
   */
  success: boolean;

  /**
   * HTTP status code
   */
  statusCode: number;

  /**
   * Response message
   */
  message: string;

  /**
   * Response data (optional)
   */
  data?: T;

  /**
   * Error details (optional)
   */
  error?: any;

  /**
   * Constructor for creating a standardized API response
   */
  constructor(success: boolean, statusCode: number, message: string, data?: T, error?: any) {
    this.success = success;
    this.statusCode = statusCode;
    this.message = message;

    if (data !== undefined) {
      this.data = data;
    }

    if (error !== undefined) {
      this.error = error;
    }
  }

  /**
   * Static method to create a success response
   */
  static success<T>(statusCode: number = 200, message: string = 'Success', data?: T): ApiResponseDto<T> {
    return new ApiResponseDto<T>(true, statusCode, message, data);
  }

  /**
   * Static method to create an error response
   */
  static error<T>(statusCode: number = 400, message: string = 'Error occurred', error?: any): ApiResponseDto<T> {
    return new ApiResponseDto<T>(false, statusCode, message, undefined, error);
  }
} 
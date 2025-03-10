/**
 * Service Response DTO
 * This class defines the structure for all service responses in the application
 * It's used internally by services before the response interceptor transforms it to ApiResponseDto
 */
export class ServiceResponseDto<T> {
  /**
   * Response message
   */
  message: string;

  /**
   * Response data (optional)
   */
  data?: T;

  /**
   * Constructor for creating a standardized service response
   */
  constructor(message: string, data?: T) {
    this.message = message;

    if (data !== undefined) {
      this.data = data;
    }
  }

  /**
   * Static method to create a success response
   */
  static success<T>(message: string = 'Operation successful', data?: T): ServiceResponseDto<T> {
    return new ServiceResponseDto<T>(message, data);
  }
} 
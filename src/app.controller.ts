import { Controller, Get, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiResponseDto } from './common/dto/api-response.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): ApiResponseDto<string> {
    const message = this.appService.getHello();
    return ApiResponseDto.success(HttpStatus.OK, 'Hello message retrieved successfully', message);
  }
}

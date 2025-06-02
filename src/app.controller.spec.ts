import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiResponseDto } from './common/dto/api-response.dto';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return a structured response with "Hello World!" data', () => {
      const result = appController.getHello();
      const expectedResponse = ApiResponseDto.success(
        HttpStatus.OK,
        'Hello message retrieved successfully',
        'Hello World!'
      );
      expect(result).toEqual(expectedResponse);
    });
  });
});

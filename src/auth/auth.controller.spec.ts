import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    // Create a mock AuthService
    const mockAuthService = {
      generateJwt: jest.fn(),
      createGoogleUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('googleAuth', () => {
    it('should have a method that initiates Google authentication', () => {
      // This endpoint only initiates OAuth flow, doesn't return anything
      expect(controller.googleAuth).toBeDefined();
    });
  });

  describe('googleAuthRedirect', () => {
    it('should handle Google callback and return user and token data', async () => {
      // Mock request with Google user data
      const mockUser = {
        user: {
          user_id: 1,
          email: 'google@example.com',
          username: 'Google User',
        },
        jwt: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        },
      };

      const mockRequest = { user: mockUser };

      const expectedResponse = ApiResponseDto.success(
        HttpStatus.OK,
        'Google Sign-In/Sign-Up successful',
        {
          user: mockUser.user,
          accessToken: mockUser.jwt.accessToken,
          refreshToken: mockUser.jwt.refreshToken,
        }
      );

      // Call the controller method
      const result = await controller.googleAuthRedirect(mockRequest as any);

      // Assertions
      expect(result).toEqual(expectedResponse);
    });
  });
}); 
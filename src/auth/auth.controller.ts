import { Controller, Get, HttpStatus, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // Google OAuth sign-in and sign-up route
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) { }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req): Promise<ApiResponseDto<any>> {
    const { user, jwt } = req.user;
    return ApiResponseDto.success(
      HttpStatus.OK,
      'Google Sign-In/Sign-Up successful',
      {
        user,
        accessToken: jwt.accessToken,
        refreshToken: jwt.refreshToken,
      }
    );
  }
}

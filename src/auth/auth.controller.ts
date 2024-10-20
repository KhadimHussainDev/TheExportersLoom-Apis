import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Google OAuth sign-up/login route
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // Google OAuth will handle this automatically
  }

  // Callback URL for Google OAuth
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req) {
    // Send JWT token to client
    return {
      success: true,
      message: 'Google authentication successful',
      user: req.user.user, // User details
      accessToken: req.user.jwt.accessToken, // Access JWT token
      refreshToken: req.user.jwt.refreshToken, // Refresh token (if implemented)
    };
  }
}

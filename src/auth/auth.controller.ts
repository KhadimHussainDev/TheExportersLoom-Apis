import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  // Google OAuth sign-in and sign-up route
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))  
  async googleAuthRedirect(@Req() req) {
    const { user, jwt } = req.user;
    return {
      success: true,
      message: 'Google Sign-In/Sign-Up successful',
      user,
      accessToken: jwt.accessToken,
      refreshToken: jwt.refreshToken, 
    };
  }
}

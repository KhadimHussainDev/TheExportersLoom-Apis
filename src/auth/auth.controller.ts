import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Regular login with email and password
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const user = await this.authService.validateUser(
      loginUserDto.email,
      loginUserDto.password,
    );

    if (!user) {
      return { message: 'Invalid credentials' };
    }

    const token = await this.authService.login(user); // Get JWT token

    return {
      message: 'Login successful',
      ...token, // Return JWT token
    };
  }

  // Google OAuth sign-in route
  @Get('google')
  @UseGuards(AuthGuard('google-signin'))  // Using 'google-signin' strategy
  async googleAuth(@Req() req) {
    // Google OAuth will handle this automatically
  }

  // Callback for Google OAuth Sign-In
  @Get('google/callback')
  @UseGuards(AuthGuard('google-signin'))  // Using 'google-signin' strategy
  async googleAuthRedirect(@Req() req) {
    return {
      success: true,
      message: 'Google Sign-In successful',
      user: req.user.user, // User details
      accessToken: req.user.jwt.accessToken, // Access JWT token
      refreshToken: req.user.jwt.refreshToken, // Refresh token (if implemented)
    };
  }

  // Google OAuth sign-up route
  @Get('google/signup')
  @UseGuards(AuthGuard('google-signup'))  // Using 'google-signup' strategy
  async googleSignUpAuth(@Req() req) {
    // Google OAuth will handle this automatically for sign-up
  }

  // Callback for Google OAuth Sign-Up
  @Get('google/signupcallback')
  @UseGuards(AuthGuard('google-signup'))  // Using 'google-signup' strategy
  async googleSignUpRedirect(@Req() req) {
    return {
      success: true,
      message: 'Google Sign-Up successful',
      user: req.user.user, // User details
      accessToken: req.user.jwt.accessToken, // Access JWT token
      refreshToken: req.user.jwt.refreshToken, // Refresh token (if implemented)
    };
  }
}

import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth-google')
export class AuthGoogleController {
  constructor(private readonly authService: AuthService) {}

  // Google sign-in route
  @Get('google')
  @UseGuards(AuthGuard('google-signin'))  // Use 'google-signin' strategy
  async googleAuth(@Req() req) {
    // Google OAuth will handle this automatically
  }

  // Google sign-in callback
  @Get('google/callback')
  @UseGuards(AuthGuard('google-signin'))  // Use 'google-signin' strategy
  async googleAuthRedirect(@Req() req) {
    return this.authService.googleLogin(req); // Handle the login in AuthService
  }

  // Google sign-up route
  @Get('google/signup')
  @UseGuards(AuthGuard('google-signup'))  // Use 'google-signup' strategy
  async googleSignUpAuth(@Req() req) {
    // Google OAuth will handle sign-up
  }

  // Google sign-up callback
  @Get('google/signupcallback')
  @UseGuards(AuthGuard('google-signup'))  // Use 'google-signup' strategy
  async googleSignUpRedirect(@Req() req) {
    return this.authService.registerGoogleUser(req.user);  // Handle the sign-up in AuthService
  }
}

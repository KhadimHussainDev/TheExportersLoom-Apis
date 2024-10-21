import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from '../users/dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
      ...token, 
    };
  }
}

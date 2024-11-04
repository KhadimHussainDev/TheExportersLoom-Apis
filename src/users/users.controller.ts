import { Controller, Post, Body, Get, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { AuthService } from '../auth/auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  // Signup route to register a new user
  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto): Promise<any> {
    console.log('Sign-up request received', createUserDto);
    try {
      const result = await this.usersService.create(createUserDto);
      return { success: true, ...result };
    } catch (error) {
      console.error('Error occurred during signup:', error);
      throw new HttpException(
        {
          success: false,
          message: 'User registration failed',
          error: error.message || 'Unknown error occurred',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  // Regular login with email and password
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const user = await this.usersService.validateUser(
      loginUserDto.email,
      loginUserDto.password,
    );

    if (!user) {
      return { message: 'Invalid credentials' };
    }
    const token = await this.usersService.login(user);

    return {
      message: 'Login successful',
      ...token,
    };
  }

  // Get all users route
  @Get()
  getAllUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.usersService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.usersService.resetPassword(
      resetPasswordDto.resetToken,
      resetPasswordDto.newPassword,
    );
  }
}

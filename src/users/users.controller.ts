import {
  Controller,
  Post,
  Delete,
  Put,
  Body,
  Req,
  Get,
  HttpException,
  ParseIntPipe,
  HttpStatus,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { AuthService } from '../auth/auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email-token.dto';
import { UpdateUserDto } from './dto/update-users.dto';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  // Signup route to register a new user
  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto): Promise<any> {
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
  // Get user by ID
  @Get(':id')
  async getUserById(@Param('id') id: number): Promise<User> {
    const user = await this.usersService.findOneById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  // Mark a user as inactive (soft delete)
  @Delete(':id')
  async deleteUser(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    const result = await this.usersService.deleteUserById(id);
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { message: 'User status set to inactive successfully' };
  }

  @Put(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<{ message: string; user: User }> {
    const updatedUser = await this.usersService.updateUser(id, updateUserDto);

    return {
      message: 'User updated successfully',
      user: updatedUser,
    };
  }

  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.usersService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.usersService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.resetToken,
      resetPasswordDto.newPassword,
    );
  }
  @Post('request-email-verification')
  requestEmailVerification(@Body() { email }: ForgotPasswordDto) {
    return this.usersService.requestEmailVerification(email);
  }
  @Post('verify-email')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return await this.usersService.verifyEmail(
      verifyEmailDto.email,
      verifyEmailDto.code,
    );
  }
}

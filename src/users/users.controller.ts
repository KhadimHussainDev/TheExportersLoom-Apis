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
  ) { }

  // Signup route to register a new user
  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto): Promise<any> {
    try {
      const result = await this.usersService.create(createUserDto);
      return { success: true, statusCode: HttpStatus.OK, ...result };
    } catch (error) {
      console.error('Error occurred during signup:', error);
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
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
      return { success: false, statusCode: HttpStatus.UNAUTHORIZED, message: 'Invalid credentials' };
    }
    const token = await this.usersService.login(user);

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Login successful',
      ...token,
    };
  }

  // Get all users route
  @Get()
  async getAllUsers(): Promise<any> {
    const users = await this.usersService.findAll();
    return { success: true, statusCode: HttpStatus.OK, users };
  }

  // Get user by ID
  @Get(':id')
  async getUserById(@Param('id') id: number): Promise<any> {
    const user = await this.usersService.findOneById(id);
    if (!user) {
      return new NotFoundException({
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: `User with ID ${id} not found`,
      });
    }
    return { success: true, statusCode: HttpStatus.OK, user };
  }

  // Mark a user as inactive (soft delete)
  @Delete(':id')
  async deleteUser(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<any> {
    const result = await this.usersService.deleteUserById(id);
    if (!result) {
      return new NotFoundException({
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: `User with ID ${id} not found`,
      });
    }
    return { success: true, statusCode: HttpStatus.OK, message: 'User status set to inactive successfully' };
  }

  @Put(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<any> {
    const updatedUser = await this.usersService.updateUser(id, updateUserDto);

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'User updated successfully',
      user: updatedUser,
    };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<any> {
    await this.usersService.forgotPassword(forgotPasswordDto.email);
    return { success: true, statusCode: HttpStatus.OK, message: 'Password reset link sent' };
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<any> {
    await this.usersService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.resetToken,
      resetPasswordDto.newPassword,
    );
    return { success: true, statusCode: HttpStatus.OK, message: 'Password reset successful' };
  }

  @Post('request-email-verification')
  async requestEmailVerification(@Body() { email }: ForgotPasswordDto): Promise<any> {
    await this.usersService.requestEmailVerification(email);
    return { success: true, statusCode: HttpStatus.OK, message: 'Email verification link sent' };
  }

  @Post('verify-email')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<any> {
    await this.usersService.verifyEmail(
      verifyEmailDto.email,
      verifyEmailDto.code,
    );
    return { success: true, statusCode: HttpStatus.OK, message: 'Email verified successfully' };
  }
}
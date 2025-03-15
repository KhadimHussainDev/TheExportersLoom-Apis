import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth/auth.service';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateUserDto } from './dto/update-users.dto';
import { VerifyEmailDto } from './dto/verify-email-token.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private readonly authService: AuthService,
  ) { }

  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto): Promise<ApiResponseDto<any>> {
    // try {
    const accessToken = await this.usersService.create(createUserDto);
    return ApiResponseDto.success(HttpStatus.CREATED, 'User registered successfully', accessToken);
    // } catch (error) {
    //   if (error instanceof HttpException) {
    //     throw error;
    //   }
    //   throw new HttpException(
    //     'Failed to register user',
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //   );
    // }
  }

  // Regular login with email and password
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    // try {
    const accessToken = await this.usersService.validateUser(loginUserDto.email, loginUserDto.password);
    return accessToken;
    // } catch (error) {
    //   if (error instanceof HttpException) {
    //     throw error;
    //   }
    //   throw new HttpException(
    //     error.message || 'Failed to login',
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //   );
    // }
  }

  @Get()
  async getAllUsers(): Promise<ApiResponseDto<User[]>> {
    // try {
    const users = await this.usersService.findAll();
    return ApiResponseDto.success(HttpStatus.OK, 'Users retrieved successfully', users);
    // } catch (error) {
    //   if (error instanceof HttpException) {
    //     throw error;
    //   }
    //   throw new HttpException(
    //     error.message || 'Failed to retrieve users',
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //   );
    // }
  }

  @Get(':id')
  async getUserById(@Param('id') id: number): Promise<ApiResponseDto<User>> {
    // try {
    const user = await this.usersService.findOne(id);
    return ApiResponseDto.success(HttpStatus.OK, 'User retrieved successfully', user);
    // } catch (error) {
    //   if (error instanceof HttpException) {
    //     throw error;
    //   }
    //   throw new HttpException(
    //     'Failed to retrieve user',
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //   );
    // }
  }

  @Get('profile/:id')
  async getUserProfile(@Param('id') id: number): Promise<ApiResponseDto<User>> {
    const user = await this.usersService.getUserProfile(id);
    return ApiResponseDto.success(HttpStatus.OK, 'User profile retrieved successfully', user);
  }

  @Delete(':id')
  async deleteUser(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponseDto<null>> {
    // try {
    await this.usersService.deleteUserById(id);
    return ApiResponseDto.success(HttpStatus.OK, 'User deleted successfully');
    // } catch (error) {
    //   if (error instanceof HttpException) {
    //     throw error;
    //   }
    //   throw new HttpException(
    //     'Failed to delete user',
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //   );
    // }
  }

  @Put(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<any> {
    // try {
    const updatedUser = await this.usersService.updateUser(id, updateUserDto);
    return ApiResponseDto.success(HttpStatus.OK, 'User updated successfully', updatedUser);

    // } catch (error) {
    //   if (error instanceof HttpException) {
    //     throw error;
    //   }
    //   throw new HttpException(
    //     error.message || 'Failed to update user',
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //   );
    // }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<any> {
    // try {
    await this.usersService.forgotPassword(forgotPasswordDto.email);
    return ApiResponseDto.success(HttpStatus.OK, 'Password reset link sent');
    // } catch (error) {
    //   if (error instanceof HttpException) {
    //     throw error;
    //   }
    //   throw new HttpException(
    //     error.message || 'Failed to process forgot password request',
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //   );
    // }
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<any> {
    // try {
    await this.usersService.resetPassword(resetPasswordDto.email, resetPasswordDto.resetToken, resetPasswordDto.newPassword);
    return ApiResponseDto.success(HttpStatus.OK, 'Password reset successful');
    // } catch (error) {
    //   if (error instanceof HttpException) {
    //     throw error;
    //   }
    //   throw new HttpException(
    //     error.message || 'Failed to reset password',
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //   );
    // }
  }

  @Post('request-email-verification')
  async requestEmailVerification(@Body() { email }: ForgotPasswordDto): Promise<any> {
    // try {
    await this.usersService.requestEmailVerification(email);
    return ApiResponseDto.success(HttpStatus.OK, 'Email verification link sent');
    // } catch (error) {
    //   if (error instanceof HttpException) {
    //     throw error;
    //   }
    //   throw new HttpException(
    //     error.message || 'Failed to send verification email',
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //   );
    // }
  }

  @Post('verify-email')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<any> {
    // try {
    await this.usersService.verifyEmail(verifyEmailDto.email, verifyEmailDto.code);
    return ApiResponseDto.success(HttpStatus.OK, 'Email verified successfully');
    // } catch (error) {
    //   if (error instanceof HttpException) {
    //     throw error;
    //   }
    //   throw new HttpException(
    //     error.message || 'Failed to verify email',
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //   );
    // }
  }
}
// src/users/users.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto): Promise<any> {
    console.log('Sign-up request received', createUserDto); // Log the incoming data
    await this.usersService.create(createUserDto);
    return { success: true, message: 'User registered successfully' };
  }
}
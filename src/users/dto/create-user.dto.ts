// src/users/dto/create-user.dto.ts
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsNumberString,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'username must not be empty' })
  @IsString({ message: 'username must be a string' })
  username: string;

  @IsEmail({}, { message: 'email must be a valid email address' })
  email: string;

  @IsNotEmpty({ message: 'password must not be empty' })
  @MinLength(6, { message: 'password must be at least 6 characters long' })
  password: string;

  @IsString({ message: 'userType must be a string' })
  @IsNotEmpty({ message: 'userType must not be empty' })
  userType: string;

  @IsString({ message: 'name must be a string' })
  @IsOptional()
  name?: string;

  @IsString({ message: 'companyName must be a string' })
  @IsOptional()
  companyName?: string;

  @IsNumberString({}, { message: 'phone must be a valid phone number' })
  @IsOptional()
  phone?: string;

  @IsString({ message: 'cnic must be a string' })
  @IsOptional()
  cnic?: string;

  @IsString({ message: 'address must be a string' })
  @IsOptional()
  address?: string;
}

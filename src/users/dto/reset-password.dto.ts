import { IsEmail, IsString } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  resetToken: string;

  @IsString()
  newPassword: string;
}

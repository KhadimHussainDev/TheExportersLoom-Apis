import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateNotificationDto {
  @IsNotEmpty()
  userId: string;
  @IsNotEmpty()
  message: string;
  @IsOptional()
  link: string;
}
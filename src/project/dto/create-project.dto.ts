import { IsString, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  budget: number;

  @IsDateString()
  deadline: string; // Accepts date in ISO string format
}

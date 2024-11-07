import { IsString, IsNotEmpty, IsNumber, IsDateString, IsOptional, IsIn } from 'class-validator';

export class CreateModuleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  budget: number;

  @IsDateString()
  deadline: string;

  @IsOptional()
  @IsString()
  @IsIn(['draft', 'posted', 'completed']) // Allowed values for status
  status?: string; // Optional status field
}

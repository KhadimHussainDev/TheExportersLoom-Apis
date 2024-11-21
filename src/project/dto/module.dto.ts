import { IsString, IsNumber, IsDateString, IsOptional, IsIn } from 'class-validator';

export class UpdateModuleDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  budget?: number;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsString()
  @IsIn(['draft', 'posted', 'completed']) // Allowed values for status
  status?: string;
}

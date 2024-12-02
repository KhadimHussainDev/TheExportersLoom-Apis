import { IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  shirtType?: string;

  @IsOptional()
  @IsString()
  fabricCategory?: string;

  @IsOptional()
  @IsString()
  fabricSubCategory?: string;

  @IsOptional()
  @IsString()
  fabricSize?: string;

  @IsOptional()
  @IsString()
  logoPosition?: string;

  @IsOptional()
  @IsString()
  printingStyle?: string;

  @IsOptional()
  @IsString()
  logoSize?: string;

  @IsOptional()
  @IsString()
  cuttingStyle?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  userId?: number;

}

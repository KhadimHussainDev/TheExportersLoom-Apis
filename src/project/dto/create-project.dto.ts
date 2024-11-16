import { IsString, IsNumber, IsOptional, IsDecimal, Min } from 'class-validator';

export class ProjectDto {
  @IsNumber()
  @Min(1)
  userId: number;

  @IsOptional()
  @IsNumber()
  responseId?: number;

  @IsString()
  status: string;

  @IsString()
  shirtType: string;

  @IsString()
  fabricCategory: string;

  @IsOptional()
  @IsString()
  fabricSubCategory?: string;

  @IsString()
  fabricSize: string;

  @IsString()
  logoPosition: string;

  @IsString()
  printingStyle: string;

  @IsString()
  logoSize: string;

  @IsString()
  cuttingStyle: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsDecimal()
  totalEstimatedCost?: number;
}

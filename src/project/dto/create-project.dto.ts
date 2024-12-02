import {
  IsString,
  IsNumber,
  IsOptional,
  IsDecimal,
  Min,
} from 'class-validator';

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
  @IsOptional()
  logoPosition: string;

  @IsString()
  @IsOptional()
  printingStyle: string;

  @IsString()
  @IsOptional()
  logoSize: string;

  @IsString()
  @IsOptional()
  cuttingStyle: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsDecimal()
  totalEstimatedCost?: number;
}
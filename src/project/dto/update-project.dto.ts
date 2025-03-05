import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class LogoDetailDto {
  @IsString()
  logoPosition: string;

  @IsString()
  PrintingStyle: string;
}

class SizeDetailDto {
  @IsNumber()
  @Min(1)
  quantityRequired: number;

  @IsString()
  size: string;
}

export class UpdateProjectDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  userId?: number;

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
  cuttingStyle?: string;

  @IsOptional()
  @IsString()
  labelType?: string;

  @IsOptional()
  @IsBoolean()
  labelsRequired?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  numberOfLogos?: number;

  @IsOptional()
  @IsBoolean()
  packagingRequired?: boolean;

  @IsOptional()
  @IsString()
  packagingType?: string;

  @IsOptional()
  @IsBoolean()
  patternRequired?: boolean;

  @IsOptional()
  @IsBoolean()
  tagCardsRequired?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LogoDetailDto)
  logoDetails?: LogoDetailDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SizeDetailDto)
  sizes?: SizeDetailDto[];
}

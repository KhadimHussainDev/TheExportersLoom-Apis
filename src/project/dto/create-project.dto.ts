import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class LogoDetailDto {
  @IsString()
  logoPosition: string;

  @IsString()
  printingStyle: string;
}

class SizeDetailDto {
  @IsInt()
  quantity: number;

  @IsString()
  fabricSize: string;
}

export class CreateProjectDto {
  @IsInt()
  userId: number;

  @IsString()
  status: string;


  @IsString()
  shirtType: string;

  @IsString()
  fabricCategory: string;

  @IsOptional()
  @IsString()
  fabricSubCategory?: string;

  @IsOptional()
  @IsString()
  cuttingStyle?: string;

  @IsOptional()
  @IsString()
  labelType?: string;

  @IsBoolean()
  labelsRequired: boolean;

  @IsOptional()
  @IsInt()
  numberOfLogos?: number;

  @IsBoolean()
  packagingRequired: boolean;

  @IsOptional()
  @IsString()
  packagingType?: string;

  @IsBoolean()
  patternRequired: boolean;

  @IsBoolean()
  tagCardsRequired: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LogoDetailDto)
  logoDetails: LogoDetailDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SizeDetailDto)
  sizes: SizeDetailDto[];
}

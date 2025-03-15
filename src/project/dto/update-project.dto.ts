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
import { LogoDetailDto } from 'modules/logo-printing module/dto/logo-details.dto';
import { FabricSizeDetailDto } from 'modules/fabric-quantity-module/dto/fabricSizeDetails.dto';




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
  @Type(() => FabricSizeDetailDto)
  sizes?: FabricSizeDetailDto[];
}

import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LogoDetailDto } from 'modules/logo-printing module/dto/logo-details.dto';
import { FabricSizeDetailDto } from 'modules/fabric-quantity-module/dto/fabricSizeDetails.dto';



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
  @Type(() => FabricSizeDetailDto)
  sizes: FabricSizeDetailDto[];
}

// src/modules/logo-printing-module/dto/create-logo-pricing.dto.ts
import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class CreateLogoPrintingDto {
  @IsString()
  @IsNotEmpty()
  @IsIn([
    'bottom_hem',
    'center_chest',
    'full_back',
    'full_front',
    'left_chest',
    'oversized_front',
    'sleeves',
    'upper_back',
  ])
  logoPosition: string;

  @IsString()
  @IsNotEmpty()
  printingMethod: string;

  @IsString()
  @IsNotEmpty()
  logoSize: string;
}

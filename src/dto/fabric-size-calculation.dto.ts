import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateFabricSizeCalculationDTO {
  @IsString()
  shirtType: string;

  @IsString()
  fabricType: string;

  @IsNumber()
  @IsOptional()
  smallSize?: number;

  @IsNumber()
  @IsOptional()
  mediumSize?: number;

  @IsNumber()
  @IsOptional()
  largeSize?: number;

  @IsNumber()
  @IsOptional()
  xlSize?: number;
}

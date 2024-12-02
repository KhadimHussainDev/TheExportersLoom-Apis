import { IsString, IsInt, IsOptional, IsDecimal } from 'class-validator';

export class UpdateFabricQuantityDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  categoryType?: string;

  @IsOptional()
  @IsString()
  shirtType?: string;

  @IsOptional()
  @IsString()
  fabricSize?: string;

  @IsOptional()
  @IsInt()
  quantityRequired?: number;

  @IsOptional()
  @IsDecimal()
  fabricQuantityCost?: number;
}

import { IsString, IsInt, IsOptional, IsDecimal, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class FabricSizeUpdateDto {
  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsInt()
  quantityRequired?: number;
}

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
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FabricSizeUpdateDto)
  sizes?: FabricSizeUpdateDto[];

  @IsOptional()
  @IsDecimal()
  fabricQuantityCost?: number;
}

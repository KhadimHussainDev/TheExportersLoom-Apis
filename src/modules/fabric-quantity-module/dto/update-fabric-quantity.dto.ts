import { IsString, IsInt, IsOptional, IsDecimal, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FabricSizeDetailDto } from './fabricSizeDetails.dto';



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
  @Type(() => FabricSizeDetailDto)
  sizes?: FabricSizeDetailDto[];

  @IsOptional()
  @IsDecimal()
  fabricQuantityCost?: number;
}

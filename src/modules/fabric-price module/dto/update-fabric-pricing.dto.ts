import { IsOptional, IsString, IsNumber, IsIn, IsNotEmpty, IsDecimal } from 'class-validator';

export class UpdateFabricPricingDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  category?: string;

  @IsOptional()
  @IsString()
  subCategory?: string;

  @IsOptional()
  @IsNumber()
  fabricQuantityCost?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @IsIn(['draft', 'active', 'completed'])
  status?: string;

  @IsNotEmpty()
  @IsDecimal()
  price: number;
}

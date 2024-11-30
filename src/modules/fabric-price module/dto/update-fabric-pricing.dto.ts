import { IsOptional, IsString, IsNumber, IsIn, IsNotEmpty, IsDecimal } from 'class-validator';

export class UpdateFabricPricingDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  category?: string;  // Category of fabric

  @IsOptional()
  @IsString()
  subCategory?: string;  // Subcategory of fabric

  @IsOptional()
  @IsNumber()
  fabricQuantityCost?: number;  // Quantity of fabric for calculation

  @IsOptional()
  @IsString()
  description?: string;  // Optional description

  @IsOptional()
  @IsString()
  @IsIn(['draft', 'active', 'completed'])
  status?: string;  // Status of fabric pricing module

  @IsNotEmpty()
  @IsDecimal()
  price: number;
}

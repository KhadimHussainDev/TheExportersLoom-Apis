import { IsOptional, IsString, IsNumber, IsIn, IsNotEmpty, IsDecimal } from 'class-validator';
import { STATUS } from 'common';

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
  @IsIn([STATUS.DRAFT, STATUS.ACTIVE, STATUS.COMPLETED])
  status?: string;

  @IsNotEmpty()
  @IsDecimal()
  price: number;
}

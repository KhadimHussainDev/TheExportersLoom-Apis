import { IsNotEmpty, IsOptional, IsString, IsDecimal } from 'class-validator';

export class CreateFabricPricingDto {
  @IsNotEmpty()
  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  subCategory: string;

  @IsNotEmpty()
  @IsDecimal()
  price: number;

  @IsOptional()
  @IsString()
  description: string;
}

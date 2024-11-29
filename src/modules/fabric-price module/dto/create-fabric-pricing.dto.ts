import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDecimal,
  IsInt,
  IsNumber,
} from 'class-validator';

export class CreateFabricPricingDto {
  @IsNotEmpty()
  @IsInt()
  projectId: number;

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

  @IsNumber()
  fabricQuantityCost: number;
}
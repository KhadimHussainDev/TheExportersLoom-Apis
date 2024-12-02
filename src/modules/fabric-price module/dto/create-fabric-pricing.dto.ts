import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDecimal,
  IsInt,
  IsNumber,
  IsDateString
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

  @IsNotEmpty()
  @IsString()
  status: string;  // Assuming 'status' is a required field

  @IsOptional()
  @IsDateString()
  createdAt: Date;

  @IsNumber()
  fabricQuantityCost: number;
}

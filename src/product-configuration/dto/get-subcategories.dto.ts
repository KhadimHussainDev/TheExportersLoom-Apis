import { IsNotEmpty, IsString } from 'class-validator';

export class GetSubcategoriesDto {
  @IsNotEmpty()
  @IsString()
  category: string;
} 
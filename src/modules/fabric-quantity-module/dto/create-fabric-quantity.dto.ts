import { IsString, IsInt, IsDecimal } from 'class-validator';

export class CreateFabricQuantityDto {
  @IsString()
  status: string;

  @IsInt()
  projectId: number;

  @IsString()
  categoryType: string;

  @IsString()
  shirtType: string;

  @IsString()
  fabricSize: string;

  @IsDecimal()
  quantityRequired: number;
}

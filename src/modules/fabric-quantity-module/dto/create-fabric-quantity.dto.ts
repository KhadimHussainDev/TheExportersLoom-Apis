import { IsString, IsInt, IsDecimal, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FabricSizeDetailDto } from './fabricSizeDetails.dto';




export class CreateFabricQuantityDto {
  @IsString()
  status: string;

  @IsInt()
  projectId: number;

  @IsString()
  categoryType: string;

  @IsString()
  shirtType: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FabricSizeDetailDto)
  sizes: FabricSizeDetailDto[];
}

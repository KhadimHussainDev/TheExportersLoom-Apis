import { Type } from 'class-transformer';
import { IsArray, IsInt, ValidateNested } from 'class-validator';
import { FabricSizeDetailDto } from 'modules/fabric-quantity-module/dto/fabricSizeDetails.dto';
import { LogoDetailDto } from './logo-details.dto';

export class CreateLogoPrintingDto {
  @IsInt()
  projectId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LogoDetailDto)
  logoDetails: LogoDetailDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FabricSizeDetailDto)
  sizes: FabricSizeDetailDto[];
}
import { IsString, IsNotEmpty, IsIn, IsArray, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { FabricSizeDetailDto } from 'modules/fabric-quantity-module/dto/fabricSizeDetails.dto';
import { LogoDetailDto } from './logo-details.dto';



export class UpdateLogoPrintingDto {
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

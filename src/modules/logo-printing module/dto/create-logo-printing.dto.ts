import { IsString, IsNotEmpty, IsIn, IsArray, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { FabricSizeDetailDto } from 'modules/fabric-quantity-module/dto/create-fabric-quantity.dto';



export class LogoDetailDto {
  @IsString()
  @IsNotEmpty()
  @IsIn([
    'Bottom Hem',
    'Center Chest',
    'Full Back',
    'Full Front',
    'Left Chest',
    'Oversized Front',
    'Sleeves',
    'Upper Back',
  ])
  logoPosition: string;

  @IsString()
  @IsNotEmpty()
  printingMethod: string;
}

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
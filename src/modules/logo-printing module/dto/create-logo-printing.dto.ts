import { IsString, IsNotEmpty, IsIn, IsInt } from 'class-validator';

export class CreateLogoPrintingDto {
  @IsInt()
  @IsNotEmpty()
  projectId: number;

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

  @IsString()
  @IsNotEmpty()
  logoSize: string;
}

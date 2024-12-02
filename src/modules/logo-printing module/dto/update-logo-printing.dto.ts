import { IsString, IsNotEmpty, IsIn, IsInt, IsOptional } from 'class-validator';

export class UpdateLogoPrintingDto {
  @IsInt()
  @IsNotEmpty()
  projectId: number; // projectId remains the same

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

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  status?: string; 
}

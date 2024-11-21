import { IsString, IsNotEmpty, IsIn, IsInt } from 'class-validator';

export class CreateLogoPrintingDto {
  @IsInt()
  @IsNotEmpty()
  projectId: number; // Include the projectId to associate this module with a specific project

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
  ]) // Use human-readable names matching the user input
  logoPosition: string;

  @IsString()
  @IsNotEmpty()
  printingMethod: string;

  @IsString()
  @IsNotEmpty()
  logoSize: string;
}

import { IsIn } from "class-validator";
import { IsString } from "class-validator";
import { IsNotEmpty } from "class-validator";

export class LogoDetailDto {
  @IsString() 
  @IsNotEmpty()
  @IsIn([
    'Bottom Hem',
    'Center Chest',
    'Full Back',
    'Full Front',
    'Left Chest',
    'Oversize Front',
    'Sleeves',
    'Upper Back',
  ])
  logoPosition: string;

  @IsString()
  @IsNotEmpty()
  printingStyle: string;
}
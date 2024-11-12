import { IsString, IsNumber } from 'class-validator';

export class CreatePatternDTO {
  @IsString()
  size: string;

  @IsNumber()
  cost: number;
}

export class UpdatePatternDTO {
  @IsString()
  size?: string;

  @IsNumber()
  cost?: number;
}

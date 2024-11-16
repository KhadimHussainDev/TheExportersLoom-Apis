import { IsString, IsNumber, Min } from 'class-validator';

export class CreateStitchingDto {
  @IsString()
  status: string;

  @IsNumber()
  projectId: number;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  ratePerShirt: number;

  @IsNumber()
  cost: number;
}

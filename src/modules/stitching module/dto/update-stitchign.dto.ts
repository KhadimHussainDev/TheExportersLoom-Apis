import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class UpdateStitchingDto {
  @IsOptional()  
  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()  
  @IsString()
  status: string;

  @IsOptional() 
  @IsNumber()
  ratePerShirt: number;

  @IsOptional() 
  @IsNumber()
  cost: number;
}

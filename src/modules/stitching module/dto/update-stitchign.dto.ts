import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class UpdateStitchingDto {
  @IsOptional()  // Allow for optional fields in case we only want to update a subset of them
  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()  // Optional field
  @IsString()
  status: string;

  @IsOptional()  // Optional fields for ratePerShirt and cost can be recalculated
  @IsNumber()
  ratePerShirt: number;

  @IsOptional()  // Optional field for cost, since this will be recalculated
  @IsNumber()
  cost: number;
}

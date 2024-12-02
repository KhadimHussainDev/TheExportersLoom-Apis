import { IsString, IsOptional, IsDecimal, IsIn, IsNumberString } from 'class-validator';

export class UpdateBidDto {
  @IsOptional() // Optional, as we don't need to update every field
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumberString()  // Allowing the price to be sent as a string
  price?: number;  // Change price to string for validation purposes

  @IsOptional()
  @IsIn(['active', 'inActive']) // Limit status to active or inactive
  status?: string;
}

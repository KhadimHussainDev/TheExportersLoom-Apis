import { IsString, IsOptional, IsDecimal, IsIn, IsNumberString, IsNumber } from 'class-validator';
import { STATUS } from '../../common';

export class UpdateBidDto {
  @IsOptional() // Optional, as we don't need to update every field
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;  // Change price to string for validation purposes

  @IsOptional()
  @IsIn([STATUS.ACTIVE, STATUS.INACTIVE]) // Limit status to active or inactive
  status?: string;
}

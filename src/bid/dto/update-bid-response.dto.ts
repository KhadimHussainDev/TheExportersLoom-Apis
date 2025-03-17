import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { STATUS } from 'common';

export class UpdateBidResponseDto {
  @IsOptional()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  message: string;

  @IsOptional()
  @IsEnum([STATUS.PENDING, STATUS.ACCEPTED, STATUS.REJECTED])
  status: string;
} 
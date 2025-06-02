import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { STATUS } from '../../common';

export class UpdateBidResponseDto {
  @IsOptional()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  message: string;

  @IsOptional()
  @IsIn([STATUS.PENDING, STATUS.ACCEPTED, STATUS.REJECTED, STATUS.CANCELLED])
  status: string;
} 
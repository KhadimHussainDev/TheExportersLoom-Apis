import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBidResponseDto {
  @IsNotEmpty()
  @IsNumber()
  bid_id: number;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  message: string;
} 
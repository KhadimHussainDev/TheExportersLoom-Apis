import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

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

  @IsNotEmpty()
  @IsNumber()
  machineId: number;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  deadline: Date;
} 
import { IsNotEmpty, IsNumber, IsString, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsNumber()
  bidId: number;

  @IsNotEmpty()
  @IsNumber()
  exporterId: number;

  @IsNotEmpty()
  @IsNumber()
  manufacturerId: number;

  @IsNotEmpty()
  @IsNumber()
  machineId: number;

  @IsNotEmpty()
  @IsString()
  status: string;
  
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  deadline: Date;
}
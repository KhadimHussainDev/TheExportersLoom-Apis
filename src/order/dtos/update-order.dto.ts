import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  completionDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deadline?: Date;
}
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty()
  @IsNumber()
  orderId: number;

  @IsNotEmpty()
  @IsNumber()
  reviewGiverId: number;

  @IsNotEmpty()
  @IsNumber()
  reviewTakerId: number;

  @IsNotEmpty()
  @IsNumber()
  machineId: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsNotEmpty()
  @IsString()
  reviewText: string;
}
import { IsNumber, Min, IsString } from 'class-validator';

export class CreatePackagingDto {
  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  status: string;

  @IsNumber()
  projectId: number;
}
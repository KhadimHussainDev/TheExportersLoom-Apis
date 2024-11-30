import { IsNumber, Min, IsString } from 'class-validator';

export class UpdatePackagingDto {
  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  status: string;
}

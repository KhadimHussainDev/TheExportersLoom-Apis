import { IsInt, IsEnum, Min } from 'class-validator';

export class UpdateCuttingDto {
  @IsEnum(['regular', 'sublimation'])
  cuttingStyle: 'regular' | 'sublimation';

  @IsInt()
  @Min(1)
  quantity: number;
}

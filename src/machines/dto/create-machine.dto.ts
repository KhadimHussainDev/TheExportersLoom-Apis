// src/machines/dto/create-machine.dto.ts
import { IsString, IsNumber, IsBoolean } from 'class-validator';

export class CreateMachineDto {
  @IsString()
  machine_type: string;

  @IsString()
  machine_model: string;

  @IsString()
  location: string;

  @IsBoolean()
  availability_status: boolean;

  @IsNumber()
  hourly_rate: number;

  @IsString()
  description: string;

  @IsString()
  machine_image: string;
}

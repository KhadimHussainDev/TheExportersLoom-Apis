// src/machines/dto/update-machine.dto.ts
import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class UpdateMachineDto {
  @IsOptional()
  @IsString()
  machine_type?: string;

  @IsOptional()
  @IsString()
  machine_model?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsBoolean()
  availability_status?: boolean;

  @IsOptional()
  @IsNumber()
  hourly_rate?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  machine_image?: string;
}

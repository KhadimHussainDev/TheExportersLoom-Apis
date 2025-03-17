import { IsEnum, IsNotEmpty, isNumber, IsNumber, IsString } from 'class-validator';
import { MODULE_TYPES } from '../../common';

export class CreateBidDto {

  @IsNumber()
  userId : number;

  @IsNotEmpty()
  @IsNumber()
  moduleId: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsEnum(MODULE_TYPES)
  moduleType: typeof MODULE_TYPES[keyof typeof MODULE_TYPES];
} 
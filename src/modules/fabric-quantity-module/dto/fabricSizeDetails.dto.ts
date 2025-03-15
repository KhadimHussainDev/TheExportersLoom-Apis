import { IsString } from "class-validator";
import { IsInt } from "class-validator";

export class FabricSizeDetailDto {
  @IsString()
  size: string;

  @IsInt()
  quantity: number;
}
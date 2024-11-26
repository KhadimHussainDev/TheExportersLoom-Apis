import { IsString, IsInt, IsDecimal } from 'class-validator';

export class CreateFabricQuantityDto {
  @IsString()
  status: string;

  @IsInt()
  projectId: number;  // Project ID will be used to associate this module with a specific project

  @IsString()
  categoryType: string; // Fabric Category (e.g., Cotton, Polyester)

  @IsString()
  shirtType: string; // Shirt Type (e.g., T-shirt, Polo)

  @IsString()
  fabricSize: string; // Fabric Size (e.g., Small, Medium, Large, XL)

  @IsDecimal()
  quantityRequired: number; // Quantity of fabric required for the project

  
}

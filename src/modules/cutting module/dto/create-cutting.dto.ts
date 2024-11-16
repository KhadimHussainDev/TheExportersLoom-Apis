// src/modules/cutting-quantity-module/dto/create-cutting.dto.ts
export class CreateCuttingDto {
  cuttingStyle: 'regular' | 'sublimation'; // Cutting style type
  quantity: number; // Quantity of shirts to be cut
  projectId: number; // The associated project ID
}

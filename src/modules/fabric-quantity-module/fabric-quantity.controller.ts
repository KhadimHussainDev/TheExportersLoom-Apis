import { Controller, Post, Body } from '@nestjs/common';
import { FabricQuantityService } from './fabric-quantity.service';
import { FabricQuantity } from './entities/fabric-quantity.entity';
import { CreateFabricQuantityDto } from './dto/create-fabric-quantity.dto';

@Controller('fabric-quantity')
export class FabricQuantityController {
  constructor(private readonly fabricQuantityService: FabricQuantityService) {}

  @Post()
  async create(
    @Body() createFabricQuantityDto: CreateFabricQuantityDto,
  ): Promise<{ message: string; data: FabricQuantity; cost: number }> {
    const { fabricQuantityEntity, fabricQuantityCost } =
      await this.fabricQuantityService.createFabricQuantityModule(
        createFabricQuantityDto,
      );
    return {
      message: 'Fabric quantity module created successfully',
      data: fabricQuantityEntity,
      cost: fabricQuantityCost,
    };
  }
}
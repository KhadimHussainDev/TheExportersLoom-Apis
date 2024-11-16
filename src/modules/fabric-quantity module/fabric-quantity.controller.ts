// src/modules/fabric-quantity-module/fabric-quantity.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { FabricQuantityService } from './fabric-quantity.service';
import { CreateFabricQuantityDto } from './dto/create-fabric-quantity.dto';
import { FabricQuantity } from './entities/fabric-quantity.entity';

@Controller('fabric-quantity')
export class FabricQuantityController {
  constructor(private readonly fabricQuantityService: FabricQuantityService) {}

  @Post()
  async create(@Body() createFabricQuantityDto: CreateFabricQuantityDto): Promise<FabricQuantity> {
    return this.fabricQuantityService.createFabricQuantityModule(createFabricQuantityDto);
  }
}

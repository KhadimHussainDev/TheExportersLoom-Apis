import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { FabricPricingService } from './fabric-pricing.service';
import { CreateFabricPricingDto } from './dto/create-fabric-pricing.dto';

@Controller('fabric-pricing')
export class FabricPricingController {
  constructor(private readonly fabricPricingService: FabricPricingService) {}

  @Post()
  async createFabricPricing(@Body() dto: CreateFabricPricingDto) {
    const { projectId } = dto; // Extract projectId from the request body
    return this.fabricPricingService.createFabricPricing(projectId, dto);
  }

  @Get('/calculate-cost/:projectId')
  async calculateFabricCost(@Param('projectId') projectId: number) {
    return this.fabricPricingService.calculateFabricCost(projectId);
  }
}

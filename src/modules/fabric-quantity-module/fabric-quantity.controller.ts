import {
  Controller, Post, Body, Get, Param, Put, NotFoundException, UseGuards
} from '@nestjs/common';
import { FabricQuantityService } from './fabric-quantity.service';
import { FabricQuantity } from './entities/fabric-quantity.entity';
import { CreateFabricQuantityDto } from './dto/create-fabric-quantity.dto';
import { UpdateFabricQuantityDto } from './dto/update-fabric-quantity.dto';
import { JwtStrategy } from '../../auth/jwt.strategy';

@Controller('fabric-quantity')
export class FabricQuantityController {
  constructor(private readonly fabricQuantityService: FabricQuantityService) { }

  @Post()
  async create(
    @Body() createFabricQuantityDto: CreateFabricQuantityDto,
  ): Promise<{ message: string; data: FabricQuantity[]; cost: number }> {
    const { fabricQuantityEntities, totalFabricQuantityCost } =
      await this.fabricQuantityService.createFabricQuantityModule(createFabricQuantityDto);

    return {
      message: 'Fabric quantity module created successfully',
      data: fabricQuantityEntities,
      cost: totalFabricQuantityCost,
    };
  }

  @Get('project/:projectId')
  async getByProjectId(@Param('projectId') projectId: number): Promise<FabricQuantity> {
    return await this.fabricQuantityService.getFabricQuantityByProjectId(projectId);
  }

  @Put('project/:projectId')
  async editFabricQuantityModule(
    @Param('projectId') projectId: number,
    @Body() updatedFabricQuantityDto: UpdateFabricQuantityDto,
  ): Promise<{ message: string; data: FabricQuantity[]; totalCost: number }> {
    try {
      // Ensure sizes array exists and is valid
      if (!updatedFabricQuantityDto.sizes || updatedFabricQuantityDto.sizes.length === 0) {
        throw new NotFoundException('Sizes array is required and cannot be empty.');
      }

      // Call the service method to update fabric quantity
      const { updatedFabricQuantities, totalFabricQuantityCost } =
        await this.fabricQuantityService.editFabricQuantityModule(
          projectId,
          updatedFabricQuantityDto,
        );

      return {
        message: 'Fabric quantity module updated successfully',
        data: updatedFabricQuantities,
        totalCost: totalFabricQuantityCost,
      };
    } catch (error) {
      throw new NotFoundException(`Fabric Quantity module update failed: ${error.message}`);
    }
  }


  @UseGuards(JwtStrategy)
  @Put('/:id/status')
  async updateFabricPricingStatus(
    @Param('id') id: number,
    @Body('newStatus') newStatus: string,
  ) {
    try {
      return await this.fabricQuantityService.updateFabricQuantityStatus(id, newStatus);
    } catch (error) {
      throw new NotFoundException(`Error updating fabric quantity module: ${error.message}`);
    }
  }
}

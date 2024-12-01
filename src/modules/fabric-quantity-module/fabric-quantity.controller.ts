import { Controller, Post, Body, Get, Param, Put, NotFoundException, UseGuards } from '@nestjs/common';
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



  // GET API to fetch the complete FabricQuantity entity by projectId
  @Get('project/:projectId')
  async getByProjectId(@Param('projectId') projectId: number): Promise<FabricQuantity> {
    // Fetch the full FabricQuantity entity based on the projectId
    const fabricQuantity = await this.fabricQuantityService.getFabricQuantityByProjectId(projectId);

    return fabricQuantity;
  }


  // edit 
  // edit API for updating fabric quantity module based on projectId
  @Put('project/:projectId')
  async editFabricQuantityModule(
    @Param('projectId') projectId: number,  // Get projectId from URL
    @Body() updatedFabricQuantityDto: UpdateFabricQuantityDto,  // Body with data to update
  ): Promise<{ message: string; data: FabricQuantity }> {
    try { 
      const updatedFabricQuantity = await this.fabricQuantityService.editFabricQuantityModule(
        projectId,  // Pass the projectId from URL to service
        updatedFabricQuantityDto,  // Pass the DTO to update the record
      );

      return {
        message: 'Fabric quantity module updated successfully',
        data: updatedFabricQuantity,
      };
    } catch (error) {
      throw new NotFoundException('Fabric Quantity module not found for projectId ' + projectId);
    }
  }

  @UseGuards(JwtStrategy)
  @Put('/:id/status')
  async updateFabricPricingStatus(
    @Param('id') id: number,  // The ID of the FabricPricingModule to update
    @Body('newStatus') newStatus: string,  // The new status to update to
  ) {
    try {
      const updatedFabricQuantityModule = await this.fabricQuantityService.updateFabricQuantityStatus(
        id,
        newStatus,
      );

      return updatedFabricQuantityModule;  // Return updated fabric pricing module with success message
    } catch (error) {
      throw new NotFoundException(
        `Error updating fabric Quantity module: ${error.message}`,
      );
    }
  }

}

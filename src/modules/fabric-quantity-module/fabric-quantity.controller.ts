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
  constructor(private readonly fabricQuantityService: FabricQuantityService) {}

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

  // @Put('project/:projectId')
  // async editFabricQuantityModule(
  //   @Param('projectId') projectId: number,
  //   @Body() updatedFabricQuantityDto: UpdateFabricQuantityDto,
  // ): Promise<{ message: string; data: FabricQuantity }> {
  //   try { 
  //     const updatedFabricQuantity = await this.fabricQuantityService.editFabricQuantityModule(
  //       projectId,
  //       updatedFabricQuantityDto,
  //     );

  //     return {
  //       message: 'Fabric quantity module updated successfully',
  //       data: updatedFabricQuantity,
  //     };
  //   } catch (error) {
  //     throw new NotFoundException(`Fabric Quantity module not found for projectId ${projectId}`);
  //   }
  // }

  // @UseGuards(JwtStrategy)
  // @Put('/:id/status')
  // async updateFabricPricingStatus(
  //   @Param('id') id: number,
  //   @Body('newStatus') newStatus: string,
  // ) {
  //   try {
  //     return await this.fabricQuantityService.updateFabricQuantityStatus(id, newStatus);
  //   } catch (error) {
  //     throw new NotFoundException(`Error updating fabric quantity module: ${error.message}`);
  //   }
  // }
}

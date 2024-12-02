import { Controller, Post, Body, NotFoundException, Put, Param, UseGuards } from '@nestjs/common';
import { CuttingService } from './cutting.service';
import { CreateCuttingDto } from './dto/create-cutting.dto';
import { DataSource } from 'typeorm';
import { Cutting } from './entities/cutting.entity';
import { UpdateCuttingDto } from './dto/update-cutting.dto';
import { JwtStrategy } from '../../auth/jwt.strategy';

@Controller('cutting')
export class CuttingController {
  constructor(
    private readonly cuttingService: CuttingService,
    private readonly dataSource: DataSource,
  ) {}

  @Put('edit/:projectId')
  async editCuttingModule(
    @Param('projectId') projectId: number,
    @Body() updateCuttingDto: UpdateCuttingDto,  // Use Update DTO here
  ): Promise<Cutting> {
    const manager = this.dataSource.createEntityManager();
    return this.cuttingService.editCuttingModule(projectId, updateCuttingDto, manager);
  }

  @UseGuards(JwtStrategy)
  @Put('/:id/status')
  async updateCuttingStatus(
    @Param('id') id: number,  // The ID of the FabricPricingModule to update
    @Body('newStatus') newStatus: string,  // The new status to update to
  ) {
    try {
      const updatedCuttingModule = await this.cuttingService.updateCuttingStatus(
        id,
        newStatus,
      );

      return updatedCuttingModule;  // Return updated fabric pricing module with success message
    } catch (error) {
      throw new NotFoundException(
        `Error updating cutting module: ${error.message}`,
      );
    }
  }
}

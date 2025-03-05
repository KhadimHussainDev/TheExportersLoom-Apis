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
    @Body() updateCuttingDto: UpdateCuttingDto,  
  ): Promise<Cutting> {
    const manager = this.dataSource.createEntityManager();
    return this.cuttingService.editCuttingModule(projectId, updateCuttingDto, manager);
  }

  @UseGuards(JwtStrategy)
  @Put('/:id/status')
  async updateCuttingStatus(
    @Param('id') id: number, 
    @Body('newStatus') newStatus: string, 
  ) {
    try {
      const updatedCuttingModule = await this.cuttingService.updateCuttingStatus(
        id,
        newStatus,
      );
      return updatedCuttingModule;  
    } catch (error) {
      throw new NotFoundException(
        `Error updating cutting module: ${error.message}`,
      );
    }
  }
}

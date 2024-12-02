import { Controller, Post, Body, NotFoundException, Put, Param } from '@nestjs/common';
import { CuttingService } from './cutting.service';
import { CreateCuttingDto } from './dto/create-cutting.dto';
import { DataSource } from 'typeorm';
import { Cutting } from './entities/cutting.entity';
import { UpdateCuttingDto } from './dto/update-cutting.dto';

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
}

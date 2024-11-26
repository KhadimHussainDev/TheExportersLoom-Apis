import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Query,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FabricPricingService } from './fabric-pricing.service';
import { CreateFabricPricingDto } from './dto/create-fabric-pricing.dto';
import { DataSource } from 'typeorm';
import { Project } from '../../project/entities/project.entity';

@Controller('fabric-pricing')
export class FabricPricingController {
  constructor(
    private readonly fabricPricingService: FabricPricingService,
    private readonly dataSource: DataSource,
  ) {}

  @Post()
  async createFabricPricing(@Body() dto: CreateFabricPricingDto) {
    const { projectId } = dto;

    try {
      console.log('Starting transaction for fabric pricing creation...');

      // Initiate a transaction and pass the manager
      const result = await this.dataSource.transaction(async (manager) => {
        console.log('Fetching project entity within transaction...');
        const project = await manager.findOne(Project, { where: { id: projectId } });

        if (!project) {
          throw new NotFoundException(`Project with ID ${projectId} not found.`);
        }

        console.log('Passing project and manager to FabricPricingService.createFabricPricing...');
        return await this.fabricPricingService.createFabricPricing(project, dto, manager);
      });

      console.log('Fabric pricing created successfully:', result);
      return {
        message: 'Fabric pricing created successfully',
        data: result,
      };
    } catch (error) {
      console.error('Error while creating fabric pricing:', error.message);
      throw error; // Let NestJS handle and send an appropriate HTTP error response
    }
  }

  @Get('/calculate-cost/:projectId')
  async calculateFabricCost(
    @Param('projectId') projectId: number,
    @Query('fabricQuantityCost') fabricQuantityCost: number,
  ) {
    if (!fabricQuantityCost) {
      throw new BadRequestException('fabricQuantityCost is required');
    }

    return this.fabricPricingService.calculateFabricCost(
      projectId,
      Number(fabricQuantityCost),
    );
  }
}

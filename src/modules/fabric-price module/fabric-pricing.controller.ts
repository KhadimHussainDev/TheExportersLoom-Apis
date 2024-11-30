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
import { FabricPricingModule } from './entities/fabric-pricing-module.entity';
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
      // Initiate a transaction and pass the manager
      const result = await this.dataSource.transaction(async (manager) => {
        const project = await manager.findOne(Project, {
          where: { id: projectId },
        });

        if (!project) {
          throw new NotFoundException(
            `Project with ID ${projectId} not found.`,
          );
        }

        return await this.fabricPricingService.createFabricPricing(
          project,
          dto,
          manager,
        );
      });

      console.log('Fabric pricing created successfully:', result);
      return {
        message: 'Fabric pricing created successfully',
        data: result,
      };
    } catch (error) {
      console.error('Error while creating fabric pricing:', error.message);
      throw error;
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

  // GET endpoint to fetch the FabricPricingModule by projectId
  @Get('/:projectId')
  async getFabricPricingByProjectId(
    @Param('projectId') projectId: number,
  ): Promise<FabricPricingModule> {
    const fabricPricingModule = await this.fabricPricingService.getFabricPricingByProjectId(
      projectId,
    );

    if (!fabricPricingModule) {
      throw new NotFoundException(
        `Fabric pricing not found for project with ID ${projectId}`,
      );
    }

    return fabricPricingModule;
  }
}

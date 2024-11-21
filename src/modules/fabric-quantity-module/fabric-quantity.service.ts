// src/modules/fabric-quantity-module/fabric-quantity.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FabricQuantity } from './entities/fabric-quantity.entity';
import { CreateFabricQuantityDto } from './dto/create-fabric-quantity.dto';
import { FabricSizeCalculation } from 'src/entities';
import { EntityManager } from 'typeorm';

@Injectable()
export class FabricQuantityService {
  constructor(
    @InjectRepository(FabricQuantity)
    private fabricQuantityRepository: Repository<FabricQuantity>,
    @InjectRepository(FabricSizeCalculation)
    private fabricSizeCalculationRepository: Repository<FabricSizeCalculation>,
  ) {}

  async createFabricQuantityModule(
    dto: CreateFabricQuantityDto,
    manager?: EntityManager,
  ): Promise<FabricQuantity> {
    const { shirtType, fabricSize, categoryType, projectId, quantityRequired } = dto;
  
    const fabricSizeCalculation = await this.fabricSizeCalculationRepository.findOne({
      where: { shirtType, fabricType: categoryType },
    });
  
    if (!fabricSizeCalculation) {
      throw new NotFoundException('Fabric size calculation not found for this type.');
    }
  
    let fabricSizeCost = 0;
    switch (fabricSize.toLowerCase()) {
      case 'small':
        fabricSizeCost = fabricSizeCalculation.smallSize || 0;
        break;
      case 'medium':
        fabricSizeCost = fabricSizeCalculation.mediumSize || 0;
        break;
      case 'large':
        fabricSizeCost = fabricSizeCalculation.largeSize || 0;
        break;
      case 'xl':
        fabricSizeCost = fabricSizeCalculation.xlSize || 0;
        break;
      default:
        throw new Error('Invalid fabric size');
    }
  
    const fabricQuantityCost = fabricSizeCost * quantityRequired;
  
    const fabricQuantity = this.fabricQuantityRepository.create({
      status: 'draft',
      projectId,
      categoryType,
      shirtType,
      fabricSize,
      quantityRequired,
      fabricQuantityCost,
    });
  
    return manager
      ? await manager.save(fabricQuantity)
      : await this.fabricQuantityRepository.save(fabricQuantity);
  }
  

  async getModuleCost(projectId: number): Promise<number> {
    const modules = await this.fabricQuantityRepository.find({ where: { projectId } });
    return modules.reduce((total, item) => total + Number(item.fabricQuantityCost), 0);
  }
}

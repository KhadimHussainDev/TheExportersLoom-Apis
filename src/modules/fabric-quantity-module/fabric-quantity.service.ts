import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { FabricQuantity } from './entities/fabric-quantity.entity';
import { CreateFabricQuantityDto } from './dto/create-fabric-quantity.dto';
import { FabricSizeCalculation } from 'entities/fabric-size-calculation.entity';

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
    console.log('Step 1: Received DTO:', dto);

    const { shirtType, fabricSize, categoryType, projectId, quantityRequired } = dto;

    // Fix the case-sensitive query
    const fabricSizeCalculation = await this.fabricSizeCalculationRepository.findOne({
      where: {
        shirtType,
        fabricType: categoryType,
      },
    });

    if (!fabricSizeCalculation) {
      console.error('Step 2: Fabric size calculation not found for:', {
        shirtType,
        categoryType,
      });
      throw new NotFoundException('Fabric size calculation not found for this type.');
    }

    console.log('Step 2: Retrieved Fabric Size Calculation:', fabricSizeCalculation);

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
        console.error('Step 3: Invalid fabric size:', fabricSize);
        throw new Error('Invalid fabric size');
    }

    const fabricQuantityCost = fabricSizeCost * quantityRequired;

    console.log('Step 4: Calculated Fabric Quantity Cost:', fabricQuantityCost);

    const fabricQuantity = this.fabricQuantityRepository.create({
      status: 'draft',
      projectId,
      categoryType,
      shirtType,
      fabricSize,
      quantityRequired,
      fabricQuantityCost,
    });

    console.log('Step 5: Saving Fabric Quantity Entity:', fabricQuantity);


    // Save the FabricQuantity entity using the transaction-scoped EntityManager or the repository
    if (manager) {
      return await manager.save(fabricQuantity);
    } else {
      return await this.fabricQuantityRepository.save(fabricQuantity);
    }
    // return manager
    //   ? await manager.save(fabricQuantity)
    //   : await this.fabricQuantityRepository.save(fabricQuantity);
  }

  async getModuleCost(projectId: number): Promise<number> {
    console.log('Step 6: Fetching Module Costs for Project ID:', projectId);

    const modules = await this.fabricQuantityRepository.find({ where: { projectId } });

    const totalCost = modules.reduce((total, item) => total + Number(item.fabricQuantityCost), 0);

    console.log('Step 7: Calculated Total Module Cost:', totalCost);

    return totalCost;
  }
}

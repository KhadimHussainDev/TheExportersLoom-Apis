import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, QueryResult } from 'typeorm';
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
  ): Promise<{
    fabricQuantityEntity: FabricQuantity;
    fabricQuantityCost: number;
  }> {
    const { shirtType, fabricSize, categoryType, projectId, quantityRequired } =
      dto;

    // Retrieve the fabric size calculation
    const fabricSizeCalculation =
      await this.fabricSizeCalculationRepository.findOne({
        where: { shirtType, fabricType: categoryType },
      });

    if (!fabricSizeCalculation) {
      console.error('Step 2: Fabric size calculation not found for:', {
        shirtType,
        categoryType,
      });
      throw new NotFoundException(
        'Fabric size calculation not found for this type.',
      );
    }

    // Calculate the fabric size cost
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
        throw new BadRequestException('Invalid fabric size provided.');
    }

    const fabricQuantityCost = fabricSizeCost * quantityRequired;

    // Create the FabricQuantity entity
    const fabricQuantity = this.fabricQuantityRepository.create({
      status: 'draft',
      projectId,
      categoryType,
      shirtType,
      fabricSize,
      quantityRequired,
      fabricQuantityCost,
    });

    // Save the FabricQuantity entity
    const savedFabricQuantity = manager
      ? await manager.save(fabricQuantity)
      : await this.fabricQuantityRepository.save(fabricQuantity);

    return {
      fabricQuantityEntity: savedFabricQuantity,
      fabricQuantityCost,
    };
  }

  async getModuleCost(projectId: number): Promise<number> {
    const fabricQuantityModule = await this.fabricQuantityRepository.findOne({
      where: { projectId },
      relations: ['project'],
    });

    if (!fabricQuantityModule) {
      return 0;
    }

    console.log('Fabric Quantity module found:', fabricQuantityModule);
    return fabricQuantityModule.fabricQuantityCost || 0;
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, QueryResult } from 'typeorm';
import { FabricQuantity } from './entities/fabric-quantity.entity';
import { CreateFabricQuantityDto } from './dto/create-fabric-quantity.dto';
import { FabricSizeCalculation } from '../../entities/fabric-size-calculation.entity';
import { UpdateFabricQuantityDto } from './dto/update-fabric-quantity.dto';

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



  // Fetch the complete FabricQuantity record by projectId
  async getFabricQuantityByProjectId(projectId: number): Promise<FabricQuantity> {
    const fabricQuantity = await this.fabricQuantityRepository.findOne({
      where: { projectId },
    });
  
    if (!fabricQuantity) {
      throw new NotFoundException(`Fabric Quantity module not found for project ID ${projectId}`);
    }
  
    return fabricQuantity;
  }


  // edit
  async editFabricQuantityModule(
    projectId: number,  // Accept projectId directly in the service
    updatedDto: UpdateFabricQuantityDto,  // Use the DTO to update only the fields provided
    manager?: EntityManager,
  ): Promise<FabricQuantity> {
    const { shirtType, fabricSize, categoryType, quantityRequired } = updatedDto;
  
    // Fetch the existing fabric quantity record based on projectId
    const existingFabricQuantity = await this.fabricQuantityRepository.findOne({
      where: { projectId },
    });
  
    if (!existingFabricQuantity) {
      throw new NotFoundException('Fabric Quantity module not found.');
    }
  
    // Retrieve fabric size cost
    const fabricSizeCalculation = await this.fabricSizeCalculationRepository.findOne({
      where: { shirtType, fabricType: categoryType },
    });
  
    if (!fabricSizeCalculation) {
      throw new NotFoundException('Fabric size calculation not found for the given type.');
    }
  
    // Calculate the fabric size cost (same logic as creation)
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
        throw new BadRequestException('Invalid fabric size');
    }
  
    // Calculate the new fabric quantity cost
    const fabricQuantityCost = fabricSizeCost * (quantityRequired || existingFabricQuantity.quantityRequired);
  
    // Update only the fields provided in the DTO
    if (updatedDto.quantityRequired !== undefined) {
      existingFabricQuantity.quantityRequired = updatedDto.quantityRequired;
    }
    if (updatedDto.fabricSize) {
      existingFabricQuantity.fabricSize = updatedDto.fabricSize;
    }
    if (updatedDto.categoryType) {
      existingFabricQuantity.categoryType = updatedDto.categoryType;
    }
    if (updatedDto.shirtType) {
      existingFabricQuantity.shirtType = updatedDto.shirtType;
    }
    if (updatedDto.status) {
      existingFabricQuantity.status = updatedDto.status;
    }
    // Update fabric quantity cost if any of the relevant fields are changed
    existingFabricQuantity.fabricQuantityCost = fabricQuantityCost;
  
    // Save the updated fabric quantity record
    const updatedFabricQuantity = await manager
      ? manager.save(existingFabricQuantity)
      : this.fabricQuantityRepository.save(existingFabricQuantity);
  
    return updatedFabricQuantity;
  }
  
}

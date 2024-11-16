// src/modules/fabric-quantity-module/fabric-quantity.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FabricQuantity } from './entities/fabric-quantity.entity';
import { CreateFabricQuantityDto } from './dto/create-fabric-quantity.dto';
import { FabricSizeCalculation } from 'src/entities';

@Injectable()
export class FabricQuantityService {
  constructor(
    @InjectRepository(FabricQuantity)
    private readonly fabricQuantityRepository: Repository<FabricQuantity>,

    @InjectRepository(FabricSizeCalculation)
    private readonly fabricSizeCalculationRepository: Repository<FabricSizeCalculation>,
  ) {}

  // Create Fabric Quantity module and calculate the cost dynamically
  async createFabricQuantityModule(createFabricQuantityDto: CreateFabricQuantityDto): Promise<FabricQuantity> {
    const { shirtType, fabricSize, categoryType, projectId, quantityRequired } = createFabricQuantityDto;

    // Fetch the fabric size calculation based on shirtType and categoryType (fabricType)
    const fabricSizeCalculation = await this.fabricSizeCalculationRepository.findOne({
      where: { shirtType, fabricType: categoryType },
    });

    if (!fabricSizeCalculation) {
      throw new NotFoundException('Fabric size calculation not found for this shirt type and fabric category');
    }

    // Calculate the fabric cost based on the fabric size
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

    // Calculate the total fabric quantity cost
    const fabricQuantityCost = fabricSizeCost * quantityRequired;

    // Create a new FabricQuantity record
    const fabricQuantity = this.fabricQuantityRepository.create({
      status: 'Active',  // Assuming status is 'Active' for now
      projectId,
      categoryType,
      shirtType,
      fabricSize,
      quantityRequired,
      fabricQuantityCost,
    });

    // Save the new fabric quantity entry to the database
    return await this.fabricQuantityRepository.save(fabricQuantity);
  }
}

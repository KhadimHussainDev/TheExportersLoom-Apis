import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
  ): Promise<{ fabricQuantityEntity: FabricQuantity; fabricQuantityCost: number }> {
    console.log('Step 1: Received DTO:', dto);
  
    const { shirtType, fabricSize, categoryType, projectId, quantityRequired } = dto;
  
    // Retrieve the fabric size calculation
    const fabricSizeCalculation = await this.fabricSizeCalculationRepository.findOne({
      where: { shirtType, fabricType: categoryType },
    });
  
    if (!fabricSizeCalculation) {
      console.error('Step 2: Fabric size calculation not found for:', {
        shirtType,
        categoryType,
      });
      throw new NotFoundException('Fabric size calculation not found for this type.');
    }
  
    console.log('Step 2: Retrieved Fabric Size Calculation:', fabricSizeCalculation);
  
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
  
    console.log('Step 4: Calculated Fabric Quantity Cost:', fabricQuantityCost);
  
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
  
    console.log('Step 5: Saving Fabric Quantity Entity:', fabricQuantity);
  
    // Save the FabricQuantity entity
    const savedFabricQuantity = manager
      ? await manager.save(fabricQuantity)
      : await this.fabricQuantityRepository.save(fabricQuantity);
  
    console.log('Step 6: Saved Fabric Quantity Entity:', savedFabricQuantity);
  
    return {
      fabricQuantityEntity: savedFabricQuantity,
      fabricQuantityCost,
    };
  }
  

  async getModuleCost(projectId: number): Promise<number> {
    console.log('Step 7: Fetching Fabric Quantity Cost for Project ID:', projectId);
  
    // Define the expected structure of the result
    type QueryResult = { fabricQuantityCost: string }; // 'string' since it's usually returned as a string from raw queries
  
    // Log the full query for debugging
    const query = this.fabricQuantityRepository
      .createQueryBuilder('fabricQuantity')
      .select('fabricQuantity.fabricQuantityCost', 'fabricQuantityCost')
      .where('fabricQuantity.projectId = :projectId', { projectId });
  
    console.log('Executing raw query:', query.getQuery()); // Log the raw SQL query
  
    // Execute the raw query to fetch the fabric quantity cost
    const result: QueryResult | undefined = await query.getRawOne();
  
    console.log('Raw query result:', result);
  
    // Safely retrieve fabricQuantityCost, defaulting to 0 if not found
    const fabricQuantityCost = result?.fabricQuantityCost ? Number(result.fabricQuantityCost) : 0;
  
    console.log('Step 8: Retrieved Fabric Quantity Cost:', fabricQuantityCost);
  
    return fabricQuantityCost;
  }
  
}

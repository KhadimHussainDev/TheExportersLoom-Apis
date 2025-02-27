import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { FabricQuantity } from './entities/fabric-quantity.entity';
import { CreateFabricQuantityDto } from './dto/create-fabric-quantity.dto';
import { FabricSizeCalculation } from '../../entities/fabric-size-calculation.entity';
import { UpdateFabricQuantityDto } from './dto/update-fabric-quantity.dto';
import { BidService } from '../../bid/bid.service';

@Injectable()
export class FabricQuantityService {
  constructor(
    @InjectRepository(FabricQuantity)
    private fabricQuantityRepository: Repository<FabricQuantity>,
    @InjectRepository(FabricSizeCalculation)
    private fabricSizeCalculationRepository: Repository<FabricSizeCalculation>,
    private readonly bidService: BidService,
  ) {}

  async createFabricQuantityModule(
    dto: CreateFabricQuantityDto,
    manager?: EntityManager,
  ): Promise<{
    fabricQuantityEntity: FabricQuantity;
    fabricQuantityCost: number;
  }> {
    const { shirtType, categoryType, projectId, sizes } = dto;

    if (!sizes || !Array.isArray(sizes) || sizes.length === 0) {
      throw new BadRequestException('Sizes array must be provided.');
    }

    let totalFabricQuantityCost = 0;

    // Iterate through each size and calculate the total fabric cost
    for (const sizeObj of sizes) {
      const { size, quantityRequired } = sizeObj;

      // Validate size and quantity
      if (!size || !quantityRequired || quantityRequired <= 0) {
        throw new BadRequestException(
          `Invalid size or quantity provided: ${JSON.stringify(sizeObj)}`,
        );
      }

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

      // Determine the fabric size cost based on size
      let fabricSizeCost = 0;
      switch (size.toLowerCase()) {
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
          console.error('Step 3: Invalid fabric size:', size);
          throw new BadRequestException(`Invalid fabric size provided: ${size}`);
      }

      // Calculate total cost for this size
      const fabricQuantityCost = fabricSizeCost * quantityRequired;
      totalFabricQuantityCost += fabricQuantityCost;
    }

    // Create the FabricQuantity entity
    const fabricQuantity = this.fabricQuantityRepository.create({
      status: 'draft',
      projectId,
      categoryType,
      shirtType,
      sizes: JSON.stringify(sizes), // Store sizes array as JSON string
      fabricQuantityCost: totalFabricQuantityCost,
    });

    // Save the FabricQuantity entity
    const savedFabricQuantity = manager
      ? await manager.save(fabricQuantity)
      : await this.fabricQuantityRepository.save(fabricQuantity);

    return {
      fabricQuantityEntity: savedFabricQuantity,
      fabricQuantityCost: totalFabricQuantityCost,
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
    projectId: number,  
    updatedDto: UpdateFabricQuantityDto, 
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
  
    // Fetch the fabric size calculation
    const fabricSizeCalculation = await this.fabricSizeCalculationRepository.findOne({
      where: { shirtType, fabricType: categoryType },
    });
  
    if (!fabricSizeCalculation) {
      throw new NotFoundException('Fabric size calculation not found for the given type.');
    }
  
    // Determine if any relevant fields have changed and recalculate fabric quantity if needed
    let recalculateCost = false;
  
    if (
      updatedDto.shirtType !== undefined &&
      updatedDto.shirtType !== existingFabricQuantity.shirtType
    ) {
      existingFabricQuantity.shirtType = updatedDto.shirtType;
      recalculateCost = true;
    }
  
    if (
      updatedDto.fabricSize !== undefined &&
      updatedDto.fabricSize !== existingFabricQuantity.fabricSize
    ) {
      existingFabricQuantity.fabricSize = updatedDto.fabricSize;
      recalculateCost = true;
    }
  
    if (
      updatedDto.categoryType !== undefined &&
      updatedDto.categoryType !== existingFabricQuantity.categoryType
    ) {
      existingFabricQuantity.categoryType = updatedDto.categoryType;
      recalculateCost = true;
    }
  
    // Recalculate the fabric quantity cost 
    if (recalculateCost) {
      let fabricSizeCost = 0;
      switch (existingFabricQuantity.fabricSize.toLowerCase()) {
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
  
      // Recalculate the fabric quantity cost 
      const fabricQuantityCost = fabricSizeCost * (quantityRequired || existingFabricQuantity.quantityRequired);
      existingFabricQuantity.fabricQuantityCost = fabricQuantityCost;
    }

    if (updatedDto.quantityRequired !== undefined) {
      existingFabricQuantity.quantityRequired = updatedDto.quantityRequired;
    }
    if (updatedDto.status !== undefined) {
      existingFabricQuantity.status = updatedDto.status;
    }
  
    // Save the updated fabric quantity record
    const updatedFabricQuantity = await manager
      ? manager.save(existingFabricQuantity)
      : this.fabricQuantityRepository.save(existingFabricQuantity);
  
    return updatedFabricQuantity;
  }
  
  async updateFabricQuantityStatus(id: number, newStatus: string) {
    // Retrieve fabricPricingModule and load the project and user relations
    const fabricQuantityModule = await this.fabricQuantityRepository.findOne({
      where: { id }, // Use the fabric pricing id to fetch the module
      relations: ['project', 'project.user'], // Ensure both project and user are loaded
    });
  
    console.log(`Updating status for fabricQuantityModule ID: ${id}`);
  
    // Check if fabricPricingModule exists
    if (!fabricQuantityModule) {
      throw new Error(`fabricQuantityModule with id ${id} not found`);
    }
  
    // Ensure 'project' and 'user' relations are loaded
    const project = fabricQuantityModule.project;
    const user = project?.user;  // Access user from the project relation
  
    if (!user) {
      throw new Error(`User related to fabricQuantityModule with id ${id} not found`);
    }

    
  
    const userId = user.user_id;
  
    // Perform action only if fabricPricingModule and newStatus are valid
    if (newStatus === 'Posted') {
      const title = 'Fabric Quantity Module';
      const description = '';
      const price = fabricQuantityModule.fabricQuantityCost;
      
      console.log(`Creating bid for fabricQuantityModule ID: ${id}, userId: ${userId}`);
      // Create a new Bid
      await this.bidService.createBid(
        userId,
        fabricQuantityModule.id,
        title,
        description,
        price,
        'Active', 
         'FabricQuantity'
      );
    }
  
    // Update status
    fabricQuantityModule.status = newStatus;
  
    // Save the updated fabricPricingModule
    await this.fabricQuantityRepository.save(fabricQuantityModule);
  }

}

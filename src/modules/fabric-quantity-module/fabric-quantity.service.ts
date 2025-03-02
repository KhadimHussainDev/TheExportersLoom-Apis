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
    fabricQuantityEntities: FabricQuantity[];
    totalFabricQuantityCost: number;
  }> {
    const { projectId, status, categoryType, shirtType, sizes } = dto;
  
    if (!sizes || !Array.isArray(sizes) || sizes.length === 0) {
      throw new BadRequestException('Sizes array must be provided.');
    }
  
    let totalFabricQuantityCost = 0;
    const savedFabricQuantities: FabricQuantity[] = [];
  
    // Mapping possible size variations to standard names
    const sizeMapping: Record<string, string> = {
      s: 'small',
      small: 'small',
      S: 'small',
      m: 'medium',
      medium: 'medium',
      M: 'medium',
      l: 'large',
      large: 'large',
      L: 'large',
      xl: 'xl',
      XL: 'xl',
      'extra large': 'xl',
    };
  
    for (const sizeObj of sizes) {
      let { size, quantityRequired } = sizeObj;
  
      if (!size || !quantityRequired || quantityRequired <= 0) {
        throw new BadRequestException(
          `Invalid fabric size or quantity: ${JSON.stringify(sizeObj)}`,
        );
      }
  
      // Normalize fabric size input
      const normalizedSize = sizeMapping[size.toLowerCase()];
      if (!normalizedSize) {
        throw new BadRequestException(`Invalid fabric size: ${size}`);
      }
  
      // Retrieve fabric size calculation
      const fabricSizeCalculation =
        await this.fabricSizeCalculationRepository.findOne({
          where: { shirtType, fabricType: categoryType },
        });
  
      if (!fabricSizeCalculation) {
        throw new NotFoundException(
          `Fabric size calculation not found for ${shirtType} - ${categoryType}`,
        );
      }
  
      let fabricSizeCost = 0;
      switch (normalizedSize) {
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
          break;
        default:
          throw new BadRequestException(`Invalid fabric size: ${size}`);
      }
  
      // Calculate total cost
      const fabricQuantityCost = fabricSizeCost * quantityRequired;
      totalFabricQuantityCost += fabricQuantityCost;
  
      // Create entity
      const fabricQuantity = this.fabricQuantityRepository.create({
        projectId,
        status,
        categoryType,
        shirtType,
        fabricSize: normalizedSize, // Save standardized size
        quantityRequired: quantityRequired,
        fabricQuantityCost,
      });
  
      // Save entity
      const savedEntity = manager
        ? await manager.save(fabricQuantity)
        : await this.fabricQuantityRepository.save(fabricQuantity);
  
      savedFabricQuantities.push(savedEntity);
    }
  
    return {
      fabricQuantityEntities: savedFabricQuantities,
      totalFabricQuantityCost,
    };
  }
  

  async getModuleCost(projectId: number): Promise<number> {
    const fabricQuantities = await this.fabricQuantityRepository.find({
      where: { projectId },
    });

    if (!fabricQuantities.length) {
      return 0;
    }

    return fabricQuantities.reduce(
      (sum, item) => sum + (item.fabricQuantityCost || 0),
      0,
    );
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
  // async editFabricQuantityModule(
  //   projectId: number,  
  //   updatedDto: UpdateFabricQuantityDto, 
  //   manager?: EntityManager,
  // ): Promise<FabricQuantity> {
  //   const { shirtType, fabricSize, categoryType, quantityRequired } = updatedDto;
  
  //   // Fetch the existing fabric quantity record based on projectId
  //   const existingFabricQuantity = await this.fabricQuantityRepository.findOne({
  //     where: { projectId },
  //   });
  
  //   if (!existingFabricQuantity) {
  //     throw new NotFoundException('Fabric Quantity module not found.');
  //   }
  
  //   // Fetch the fabric size calculation
  //   const fabricSizeCalculation = await this.fabricSizeCalculationRepository.findOne({
  //     where: { shirtType, fabricType: categoryType },
  //   });
  
  //   if (!fabricSizeCalculation) {
  //     throw new NotFoundException('Fabric size calculation not found for the given type.');
  //   }
  
  //   // Determine if any relevant fields have changed and recalculate fabric quantity if needed
  //   let recalculateCost = false;
  
  //   if (
  //     updatedDto.shirtType !== undefined &&
  //     updatedDto.shirtType !== existingFabricQuantity.shirtType
  //   ) {
  //     existingFabricQuantity.shirtType = updatedDto.shirtType;
  //     recalculateCost = true;
  //   }
  
  //   if (
  //     updatedDto.fabricSize !== undefined &&
  //     updatedDto.fabricSize !== existingFabricQuantity.fabricSize
  //   ) {
  //     existingFabricQuantity.fabricSize = updatedDto.fabricSize;
  //     recalculateCost = true;
  //   }
  
  //   if (
  //     updatedDto.categoryType !== undefined &&
  //     updatedDto.categoryType !== existingFabricQuantity.categoryType
  //   ) {
  //     existingFabricQuantity.categoryType = updatedDto.categoryType;
  //     recalculateCost = true;
  //   }
  
  //   // Recalculate the fabric quantity cost 
  //   if (recalculateCost) {
  //     let fabricSizeCost = 0;
  //     switch (existingFabricQuantity.fabricSize.toLowerCase()) {
  //       case 'small':
  //         fabricSizeCost = fabricSizeCalculation.smallSize || 0;
  //         break;
  //       case 'medium':
  //         fabricSizeCost = fabricSizeCalculation.mediumSize || 0;
  //         break;
  //       case 'large':
  //         fabricSizeCost = fabricSizeCalculation.largeSize || 0;
  //         break;
  //       case 'xl':
  //         fabricSizeCost = fabricSizeCalculation.xlSize || 0;
  //         break;
  //       default:
  //         throw new BadRequestException('Invalid fabric size');
  //     }
  
  //     // Recalculate the fabric quantity cost 
  //     const fabricQuantityCost = fabricSizeCost * (quantityRequired || existingFabricQuantity.quantityRequired);
  //     existingFabricQuantity.fabricQuantityCost = fabricQuantityCost;
  //   }

  //   if (updatedDto.quantityRequired !== undefined) {
  //     existingFabricQuantity.quantityRequired = updatedDto.quantityRequired;
  //   }
  //   if (updatedDto.status !== undefined) {
  //     existingFabricQuantity.status = updatedDto.status;
  //   }
  
  //   // Save the updated fabric quantity record
  //   const updatedFabricQuantity = await manager
  //     ? manager.save(existingFabricQuantity)
  //     : this.fabricQuantityRepository.save(existingFabricQuantity);
  
  //   return updatedFabricQuantity;
  // }
  
  // async updateFabricQuantityStatus(id: number, newStatus: string) {
  //   // Retrieve fabricPricingModule and load the project and user relations
  //   const fabricQuantityModule = await this.fabricQuantityRepository.findOne({
  //     where: { id }, // Use the fabric pricing id to fetch the module
  //     relations: ['project', 'project.user'], // Ensure both project and user are loaded
  //   });
  
  //   console.log(`Updating status for fabricQuantityModule ID: ${id}`);
  
  //   // Check if fabricPricingModule exists
  //   if (!fabricQuantityModule) {
  //     throw new Error(`fabricQuantityModule with id ${id} not found`);
  //   }
  
  //   // Ensure 'project' and 'user' relations are loaded
  //   const project = fabricQuantityModule.project;
  //   const user = project?.user;  // Access user from the project relation
  
  //   if (!user) {
  //     throw new Error(`User related to fabricQuantityModule with id ${id} not found`);
  //   }

    
  
  //   const userId = user.user_id;
  
  //   // Perform action only if fabricPricingModule and newStatus are valid
  //   if (newStatus === 'Posted') {
  //     const title = 'Fabric Quantity Module';
  //     const description = '';
  //     const price = fabricQuantityModule.fabricQuantityCost;
      
  //     console.log(`Creating bid for fabricQuantityModule ID: ${id}, userId: ${userId}`);
  //     // Create a new Bid
  //     await this.bidService.createBid(
  //       userId,
  //       fabricQuantityModule.id,
  //       title,
  //       description,
  //       price,
  //       'Active', 
  //        'FabricQuantity'
  //     );
  //   }
  
  //   // Update status
  //   fabricQuantityModule.status = newStatus;
  
  //   // Save the updated fabricPricingModule
  //   await this.fabricQuantityRepository.save(fabricQuantityModule);
  // }

}

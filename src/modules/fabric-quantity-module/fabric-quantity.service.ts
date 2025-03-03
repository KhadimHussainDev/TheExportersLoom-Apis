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
import { BidService } from 'bid/bid.service';
import { UpdateFabricQuantityDto } from './dto/update-fabric-quantity.dto';

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

   // edit
   async editFabricQuantityModule(
    projectId: number,
    updatedDto: UpdateFabricQuantityDto,
    manager?: EntityManager,
  ): Promise<{ updatedFabricQuantities: FabricQuantity[]; totalFabricQuantityCost: number }> {
    const { status, categoryType, shirtType, sizes } = updatedDto;
  
    // Fetch all existing fabric quantity records for the project
    const existingFabricQuantities = await this.fabricQuantityRepository.find({
      where: { projectId },
    });
  
    if (!existingFabricQuantities.length) {
      throw new NotFoundException('Fabric Quantity module not found for this project.');
    }
  
    if (!sizes || !Array.isArray(sizes) || sizes.length === 0) {
      throw new BadRequestException('Sizes array must be provided and cannot be empty.');
    }
  
    let totalFabricQuantityCost = 0;
    const updatedFabricQuantities: FabricQuantity[] = [];
  
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
  
      const normalizedSize = sizeMapping[size.toLowerCase()];
      if (!normalizedSize) {
        throw new BadRequestException(`Invalid fabric size: ${size}`);
      }
  
      // Retrieve fabric size calculation
      const fabricSizeCalculation = await this.fabricSizeCalculationRepository.findOne({
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
        default:
          throw new BadRequestException(`Invalid fabric size: ${size}`);
      }
  
      const fabricQuantityCost = fabricSizeCost * quantityRequired;
      totalFabricQuantityCost += fabricQuantityCost;
  
      // Find existing fabric quantity record for this size
      let fabricQuantity = existingFabricQuantities.find(fq => fq.fabricSize === normalizedSize);
  
      if (fabricQuantity) {
        // Update existing entry
        fabricQuantity.quantityRequired = quantityRequired;
        fabricQuantity.fabricQuantityCost = fabricQuantityCost;
      } else {
        // Create new entry if size wasn't found
        fabricQuantity = this.fabricQuantityRepository.create({
          projectId,
          status,
          categoryType,
          shirtType,
          fabricSize: normalizedSize,
          quantityRequired,
          fabricQuantityCost,
        });
      }
  
      // Save the updated/new entity
      const savedEntity = manager
        ? await manager.save(fabricQuantity)
        : await this.fabricQuantityRepository.save(fabricQuantity);
  
      updatedFabricQuantities.push(savedEntity);
    }
  
    return {
      updatedFabricQuantities,
      totalFabricQuantityCost,
    };
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

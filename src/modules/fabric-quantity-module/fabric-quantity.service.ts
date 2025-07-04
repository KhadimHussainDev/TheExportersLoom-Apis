import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from '../../project/entities/project.entity';
import { EntityManager, Repository } from 'typeorm';
import { FabricSizeCalculation } from '../../entities/fabric-size-calculation.entity';
import { CreateFabricQuantityDto } from './dto/create-fabric-quantity.dto';
import { UpdateFabricQuantityDto } from './dto/update-fabric-quantity.dto';
import { FabricQuantity } from './entities/fabric-quantity.entity';

@Injectable()
export class FabricQuantityService {
  constructor(
    @InjectRepository(FabricQuantity)
    private fabricQuantityRepository: Repository<FabricQuantity>,
    @InjectRepository(FabricSizeCalculation)
    private fabricSizeCalculationRepository: Repository<FabricSizeCalculation>,
    @InjectRepository(Project) // Ensure this is properly injected
    private projectRepository: Repository<Project>,
  ) { }


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

    // Fetch the existing project
    let project = await this.projectRepository.findOne({ where: { id: projectId } });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    if (!sizes || !Array.isArray(sizes) || sizes.length === 0) {
      throw new BadRequestException('Sizes array must be provided and cannot be empty.');
    }

    // Fetch existing fabric quantities for the project
    let existingFabricQuantities = await this.fabricQuantityRepository.find({
      where: { projectId },
      order: { id: 'ASC' }, // consistent order
    });

    let totalFabricQuantityCost = 0;
    const updatedFabricQuantities: FabricQuantity[] = [];

    // Mapping for size normalization
    const sizeMapping: Record<string, string> = {
      s: 'small', small: 'small', S: 'small',
      m: 'medium', medium: 'medium', M: 'medium',
      l: 'large', large: 'large', L: 'large',
      xl: 'xl', XL: 'xl', 'extra large': 'xl',
    };

    // Track index for updating existing records
    let existingIndex = 0;
    for (const sizeObj of sizes) {
      let { size, quantity } = sizeObj;

      if (!size || !quantity || quantity <= 0) {
        throw new BadRequestException(
          `Invalid fabric size or quantity: ${JSON.stringify(sizeObj)}`,
        );
      }

      const normalizedSize = sizeMapping[size.toLowerCase()];
      if (!normalizedSize) {
        throw new BadRequestException(`Invalid fabric size: ${size}`);
      }

      // Fetch fabric size calculation for cost computation
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
        case 'small': fabricSizeCost = fabricSizeCalculation.smallSize || 0; break;
        case 'medium': fabricSizeCost = fabricSizeCalculation.mediumSize || 0; break;
        case 'large': fabricSizeCost = fabricSizeCalculation.largeSize || 0; break;
        case 'xl': fabricSizeCost = fabricSizeCalculation.xlSize || 0; break;
        default:
          throw new BadRequestException(`Invalid fabric size: ${size}`);
      }

      const fabricQuantityCost = fabricSizeCost * quantity;
      totalFabricQuantityCost += fabricQuantityCost;

      // Update existing fabric quantity record
      if (existingIndex < existingFabricQuantities.length) {
        let fabricQuantity = existingFabricQuantities[existingIndex];
        fabricQuantity.fabricSize = normalizedSize;
        fabricQuantity.quantityRequired = quantity;
        fabricQuantity.fabricQuantityCost = fabricQuantityCost;
        fabricQuantity.categoryType = categoryType;
        fabricQuantity.shirtType = shirtType;

        const savedEntity = manager
          ? await manager.save(fabricQuantity)
          : await this.fabricQuantityRepository.save(fabricQuantity);
        updatedFabricQuantities.push(savedEntity);
        existingIndex++;
      } else {

        // Create a new fabric quantity record if required
        const newFabricQuantity = this.fabricQuantityRepository.create({
          projectId,
          status,
          categoryType,
          shirtType,
          fabricSize: normalizedSize,
          quantityRequired: quantity,
          fabricQuantityCost,
        });

        const savedEntity = manager
          ? await manager.save(newFabricQuantity)
          : await this.fabricQuantityRepository.save(newFabricQuantity);

        updatedFabricQuantities.push(savedEntity);
      }
    }

    // Delete extra fabric quantity records if new sizes are fewer than existing ones
    if (existingIndex < existingFabricQuantities.length) {
      const recordsToDelete = existingFabricQuantities.slice(existingIndex);
      await this.fabricQuantityRepository.remove(recordsToDelete);
    }

    project.sizes = sizes.map(sizeObj => ({
      size: sizeObj.size,
      quantity: sizeObj.quantity,
    }));

    if (manager) {
      await manager.save(project);
    } else {
      await this.projectRepository.save(project);
    }

    return {
      updatedFabricQuantities,
      totalFabricQuantityCost,
    };
  }


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
      let { size, quantity } = sizeObj;

      if (!size || !quantity || quantity <= 0) {
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
      const fabricQuantityCost = fabricSizeCost * quantity;
      totalFabricQuantityCost += fabricQuantityCost;

      // Create entity
      const fabricQuantity = this.fabricQuantityRepository.create({
        projectId,
        status,
        categoryType,
        shirtType,
        fabricSize: normalizedSize, // Save standardized size
        quantityRequired: quantity,
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
    // Find the fabricQuantityModule by ID
    const fabricQuantityModule = await this.fabricQuantityRepository.findOne({
      where: { id },
      relations: ['project', 'project.user'],
    });

    if (!fabricQuantityModule) {
      throw new NotFoundException(`FabricQuantity with ID ${id} not found.`);
    }

    // Update status
    fabricQuantityModule.status = newStatus;

    // Save the updated fabricQuantityModule
    await this.fabricQuantityRepository.save(fabricQuantityModule);
  }

}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { FabricPricing } from '../../entities/fabric-pricing.entity';
import { FabricPricingModule } from './entities/fabric-pricing-module.entity';
import { CreateFabricPricingDto } from './dto/create-fabric-pricing.dto';
import { Project } from '../../project/entities/project.entity';

@Injectable()
export class FabricPricingService {
  constructor(
    @InjectRepository(FabricPricing)
    private readonly fabricPricingRepository: Repository<FabricPricing>, // Fetch raw prices
    @InjectRepository(FabricPricingModule)
    private readonly fabricPricingModuleRepository: Repository<FabricPricingModule>, // Store processed results
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  // Fetch raw prices and calculate total cost.
  async calculateFabricCost(
    projectId: number,
    fabricQuantityCost: number,
  ): Promise<number> {
    console.log(`Calculating fabric cost for projectId: ${projectId}`);

    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found.`);
    }

    console.log(`Using fabricQuantityCost: ${fabricQuantityCost}`);

    if (fabricQuantityCost <= 0) {
      throw new BadRequestException(
        `Invalid fabric quantity cost: ${fabricQuantityCost}`,
      );
    }

    const category = project.fabricCategory.trim().toLowerCase();
    const subCategory = project.fabricSubCategory
      ? project.fabricSubCategory.trim().toLowerCase()
      : null;

    console.log(
      `Normalized inputs: category='${category}', subCategory='${subCategory}'`,
    );

    let fabricPriceRecord = await this.fabricPricingRepository
      .createQueryBuilder('fabricPricing')
      .where(
        `LOWER(TRIM("category")) = :category AND LOWER(TRIM("subCategory")) = :subCategory`,
        { category, subCategory },
      )
      .getOne();

    if (!fabricPriceRecord) {
      console.warn(
        `Price not found for category: ${category} and subCategory: ${subCategory}. Falling back.`,
      );
      fabricPriceRecord = await this.fabricPricingRepository
        .createQueryBuilder('fabricPricing')
        .where(`LOWER(TRIM("category")) = :category`, { category })
        .orderBy(`"price"`, 'DESC')
        .getOne();
    }

    if (!fabricPriceRecord) {
      throw new NotFoundException(
        `Price not found for category: ${project.fabricCategory} and subCategory: ${project.fabricSubCategory || 'N/A'}`,
      );
    }

    console.log(
      `Fetched fabric price record: ${JSON.stringify(fabricPriceRecord)}`,
    );

    const fabricPricePerUnit = Number(fabricPriceRecord.price);
    if (isNaN(fabricPricePerUnit)) {
      throw new Error(
        `Invalid price format for category: ${fabricPriceRecord.category}`,
      );
    }

    const finalCost = fabricPricePerUnit * fabricQuantityCost;
    console.log(`Calculated final fabric cost: ${finalCost}`);
    return finalCost;
  }

  // Create a fabric pricing module and store results in fabric_pricing_module.

  async createFabricPricing(
    project: Project,
    dto: Partial<CreateFabricPricingDto>,
    manager: EntityManager,
  ): Promise<number> {
    try {
      console.log(`Starting createFabricPricing for projectId: ${project.id}`);
      console.log('Received DTO:', dto);
  
      if (!project) {
        throw new NotFoundException(`Project not provided.`);
      }
  
      let fabricQuantityCost = Number(dto.fabricQuantityCost ?? 0);
      if (fabricQuantityCost <= 0 || isNaN(fabricQuantityCost)) {
        throw new BadRequestException(`Invalid fabric quantity cost: ${fabricQuantityCost}`);
      }
  
      const category = dto.category.trim().toLowerCase();
      const subCategory = dto.subCategory
        ? dto.subCategory.trim().toLowerCase()
        : null;
  
      console.log(`Normalized inputs: category='${category}', subCategory='${subCategory}'`);
  
      const fabricPriceRecord = await this.fabricPricingRepository
        .createQueryBuilder('fabricPricing')
        .where(
          `LOWER(TRIM("category")) = :category ${subCategory ? 'AND LOWER(TRIM("subCategory")) = :subCategory' : ''}`,
          { category, subCategory },
        )
        .getOne();
  
      if (!fabricPriceRecord) {
        throw new NotFoundException(`Price not found for category: ${dto.category} and subCategory: ${dto.subCategory || 'N/A'}`);
      }
  
      console.log("fabricPriceRecord:", fabricPriceRecord);
      console.log("fabricPriceRecord.price type:", typeof fabricPriceRecord.price);
      console.log("fabricPriceRecord.price:", fabricPriceRecord.price);
  
      // Extract numeric value from the price string using a regular expression.
      const priceMatch = fabricPriceRecord.price.match(/(\d+(\.\d+)?)/); // Matches digits, with optional decimal points.
      if (!priceMatch) {
        throw new Error(`Invalid price format for category: ${fabricPriceRecord.category}`);
      }
  
      const fabricPricePerUnit = parseFloat(priceMatch[0]);
      console.log("Extracted fabricPricePerUnit:", fabricPricePerUnit);
  
      const totalCost = fabricPricePerUnit * fabricQuantityCost;
      console.log("Total cost:", totalCost);
  
      const fabricPricingModule = manager.create(FabricPricingModule, {
        project,
        category: dto.category,
        subCategory: dto.subCategory,
        price: totalCost,
        status: 'draft',
        description: `Fabric pricing calculated using fabricQuantityCost: ${fabricQuantityCost}`,
      });
  
      const savedFabricPricingModule = await manager.save(FabricPricingModule, fabricPricingModule);
      console.log('Saved FabricPricingModule to DB:', JSON.stringify(savedFabricPricingModule, null, 2));
  
      return totalCost;
    } catch (error) {
      console.error('Error in createFabricPricing:', error.message);
      throw error;
    }
  }
  

  async getModuleCost(projectId: number): Promise<number> {
    const fabricPricingModule =
      await this.fabricPricingModuleRepository.findOne({
        where: { project: { id: projectId } },
        relations: ['project'],
      });

    console.log('FabricPricingModule:', fabricPricingModule);

    if (!fabricPricingModule) {
      console.log('No fabric pricing found for the project.');
      return 0;
    }

    return Number(fabricPricingModule.price) || 0;
  }


  // Fetch the fabric pricing module by projectId
  async getFabricPricingByProjectId(
    projectId: number,
  ): Promise<FabricPricingModule> {
    const fabricPricingModule = await this.fabricPricingModuleRepository.findOne({
      where: { project: { id: projectId } }, // Matching projectId
    });

    if (!fabricPricingModule) {
      throw new NotFoundException(
        `Fabric pricing not found for project with ID ${projectId}`,
      );
    }

    return fabricPricingModule;
  }
}

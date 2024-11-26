import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { FabricPricing } from './entities/fabric-pricing.entity';
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

  /**
   * Fetch raw prices and calculate total cost.
   */
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

  /**
   * Create a fabric pricing module and store results in fabric_pricing_module.
   */
  async createFabricPricing(
    project: Project, // Accept the project entity directly
    dto: Partial<CreateFabricPricingDto>,
    manager: EntityManager,
  ): Promise<FabricPricingModule> {
    try {
      console.log(`Starting createFabricPricing for projectId: ${project.id}`);
      console.log('Received DTO:', dto);

      if (!project) {
        throw new NotFoundException(`Project not provided.`);
      }

      const fabricQuantityCost = dto.fabricQuantityCost ?? 0;
      if (fabricQuantityCost <= 0) {
        throw new BadRequestException(
          `Invalid fabric quantity cost: ${fabricQuantityCost}`,
        );
      }

      const category = dto.category.trim().toLowerCase();
      const subCategory = dto.subCategory
        ? dto.subCategory.trim().toLowerCase()
        : null;

      console.log(
        `Normalized inputs: category='${category}', subCategory='${subCategory}'`,
      );

      const fabricPriceRecord = await this.fabricPricingRepository
        .createQueryBuilder('fabricPricing')
        .where(
          `LOWER(TRIM("category")) = :category ${
            subCategory ? 'AND LOWER(TRIM("subCategory")) = :subCategory' : ''
          }`,
          { category, subCategory },
        )
        .getOne();

      if (!fabricPriceRecord) {
        throw new NotFoundException(
          `Price not found for category: ${dto.category} and subCategory: ${dto.subCategory || 'N/A'}`,
        );
      }

      const totalCost = Number(fabricPriceRecord.price) * fabricQuantityCost;

      const fabricPricingModule = manager.create(FabricPricingModule, {
        project, // Use the passed project entity
        category: dto.category,
        subCategory: dto.subCategory,
        price: totalCost,
        description: `Fabric pricing calculated using fabricQuantityCost: ${fabricQuantityCost}`,
      });

      const savedFabricPricingModule = await manager.save(
        FabricPricingModule,
        fabricPricingModule,
      );
      console.log(
        'Saved FabricPricingModule to DB:',
        JSON.stringify(savedFabricPricingModule, null, 2),
      );
      return savedFabricPricingModule;
    } catch (error) {
      console.error('Error in createFabricPricing:', error.message);
      throw error;
    }
  }

  /**
   * Get total cost of all FabricPricingModules linked to a project.
   */
  async getModuleCost(projectId: number): Promise<number> {
    try {
      const fabricPricings = await this.fabricPricingModuleRepository.find({
        where: { project: { id: projectId } },
      });

      if (!fabricPricings || fabricPricings.length === 0) {
        console.warn(
          `No FabricPricing modules found for projectId: ${projectId}`,
        );
        return 0;
      }

      const totalCost = fabricPricings.reduce((total, pricing) => {
        const price = Number(pricing.price);
        if (isNaN(price)) {
          console.warn(
            `Invalid price found in FabricPricingModule entry:`,
            pricing,
          );
          return total;
        }
        return total + price;
      }, 0);

      console.log(
        `Calculated total cost of FabricPricingModules: ${totalCost}`,
      );
      return totalCost;
    } catch (error) {
      console.error(`Error fetching FabricPricingModules: ${error.message}`);
      throw error;
    }
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BidService } from '../../bid/bid.service';
import { MODULE_TITLES, MODULE_TYPES, STATUS } from '../../common';
import { FabricPricing } from '../../entities/fabric-pricing.entity';
import { Project } from '../../project/entities/project.entity';
import { CreateFabricPricingDto } from './dto/create-fabric-pricing.dto';
import { UpdateFabricPricingDto } from './dto/update-fabric-pricing.dto';
import { FabricPricingModule } from './entities/fabric-pricing-module.entity';

@Injectable()
export class FabricPricingService {
  constructor(
    @InjectRepository(FabricPricing)
    private readonly fabricPricingRepository: Repository<FabricPricing>,
    @InjectRepository(FabricPricingModule)
    private readonly fabricPricingModuleRepository: Repository<FabricPricingModule>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly bidService: BidService,
  ) { }

  // Fetch raw prices and calculate total cost.
  async calculateFabricCost(
    projectId: number,
    fabricQuantityCost: number,
  ): Promise<number> {

    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found.`);
    }

    if (fabricQuantityCost <= 0) {
      throw new BadRequestException(
        `Invalid fabric quantity cost: ${fabricQuantityCost}`,
      );
    }

    const category = project.fabricCategory.trim().toLowerCase();
    const subCategory = project.fabricSubCategory
      ? project.fabricSubCategory.trim().toLowerCase()
      : null;

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

    const fabricPricePerUnit = Number(fabricPriceRecord.price);
    if (isNaN(fabricPricePerUnit)) {
      throw new Error(
        `Invalid price format for category: ${fabricPriceRecord.category}`,
      );
    }

    const finalCost = fabricPricePerUnit * fabricQuantityCost;
    return finalCost;
  }

  // Creating fabric price module
  async createFabricPricing(
    project: Project,
    dto: Partial<CreateFabricPricingDto>,
    manager: EntityManager,
  ): Promise<number> {
    try {
      // console.log(`Starting createFabricPricing for projectId: ${project.id}`);
      // console.log('Received DTO:', dto);

      if (!project) {
        throw new NotFoundException(`Project not provided.`);
      }

      let fabricQuantityCost = Number(dto.fabricQuantityCost ?? 0);
      if (fabricQuantityCost <= 0 || isNaN(fabricQuantityCost)) {
        throw new BadRequestException(
          `Invalid fabric quantity cost: ${fabricQuantityCost}`,
        );
      }

      const category = dto.category.trim().toLowerCase();
      const subCategory = dto.subCategory
        ? dto.subCategory.trim().toLowerCase()
        : null;

      const fabricPriceRecord = await this.fabricPricingRepository
        .createQueryBuilder('fabricPricing')
        .where(
          `LOWER(TRIM("category")) = :category ${subCategory ? 'AND LOWER(TRIM("subCategory")) = :subCategory' : ''}`,
          { category, subCategory },
        )
        .getOne();

      if (!fabricPriceRecord) {
        throw new NotFoundException(
          `Price not found for category: ${dto.category} and subCategory: ${dto.subCategory || 'N/A'}`,
        );
      }


      // Extract numeric value from the price string using a regular expression.
      const priceMatch = fabricPriceRecord.price.match(/(\d+(\.\d+)?)/);
      if (!priceMatch) {
        throw new Error(
          `Invalid price format for category: ${fabricPriceRecord.category}`,
        );
      }

      const fabricPricePerUnit = parseFloat(priceMatch[0]);
      const totalCost = fabricPricePerUnit * fabricQuantityCost;
      // console.log('Total cost:', totalCost);

      const fabricPricingModule = manager.create(FabricPricingModule, {
        project,
        category: dto.category,
        subCategory: dto.subCategory,
        price: totalCost,
        status: STATUS.ACTIVE,
        description: `Fabric pricing calculated using fabricQuantityCost: ${fabricQuantityCost}`,
      });

      const savedFabricPricingModule = await manager.save(
        FabricPricingModule,
        fabricPricingModule,
      );
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

    if (!fabricPricingModule) {
      // console.log('No fabric pricing found for the project.');
      return 0;
    }

    return Number(fabricPricingModule.price) || 0;
  }

  // Fetch the fabric pricing module by projectId
  async getFabricPricingByProjectId(
    projectId: number,
  ): Promise<FabricPricingModule> {
    const fabricPricingModule =
      await this.fabricPricingModuleRepository.findOne({
        where: { project: { id: projectId } },
      });

    if (!fabricPricingModule) {
      throw new NotFoundException(
        `Fabric pricing not found for project with ID ${projectId}`,
      );
    }
    return fabricPricingModule;
  }

  //Edit fabric price method
  async editFabricPricingModule(
    projectId: number,
    updatedDto: UpdateFabricPricingDto,
    manager?: EntityManager,
  ): Promise<FabricPricingModule> {
    const { category, subCategory, fabricQuantityCost } = updatedDto;

    // Ensure fabricQuantityCost is a valid number
    const validFabricQuantityCost = Number(fabricQuantityCost);
    if (isNaN(validFabricQuantityCost) || validFabricQuantityCost <= 0) {
      throw new BadRequestException('Invalid fabric quantity cost provided.');
    }

    // Fetch the existing fabric pricing module by projectId
    const existingFabricPricingModule = await this.fabricPricingModuleRepository.findOne({
      where: { project: { id: projectId } },
      relations: ['project'],
    });

    if (!existingFabricPricingModule) {
      throw new NotFoundException(`Fabric Pricing module not found for projectId: ${projectId}`);
    }

    // Fetch the price based on the updated category and subCategory
    let fabricPriceRecord = await this.fabricPricingRepository
      .createQueryBuilder('fabricPricing')
      .where(
        `LOWER(TRIM("category")) = :category ${subCategory ? 'AND LOWER(TRIM("subCategory")) = :subCategory' : ''}`,
        { category: category.trim().toLowerCase(), subCategory: subCategory?.trim().toLowerCase() },
      )
      .getOne();

    // Fallback if no exact match is found
    if (!fabricPriceRecord) {
      fabricPriceRecord = await this.fabricPricingRepository
        .createQueryBuilder('fabricPricing')
        .where('LOWER(TRIM("category")) = :category', { category: category.trim().toLowerCase() })
        .orderBy('price', 'DESC')
        .getOne();
    }

    if (!fabricPriceRecord) {
      throw new NotFoundException(
        `Price not found for category: ${category} and subCategory: ${subCategory || 'N/A'}`,
      );
    }

    // Extract numeric value from the price string using a regular expression.
    const priceMatch = fabricPriceRecord.price.match(/(\d+(\.\d+)?)/); // Matches digits, with optional decimal points.
    if (!priceMatch) {
      throw new Error(`Invalid price format for category: ${fabricPriceRecord.category}`);
    }

    const fabricPricePerUnit = parseFloat(priceMatch[0]);
    // Calculate new total cost based on updated fabricQuantityCost
    const totalCost = fabricPricePerUnit * validFabricQuantityCost;

    // Update fabric pricing module
    let priceUpdated = false;

    if (category && existingFabricPricingModule.category !== category) {
      existingFabricPricingModule.category = category;
      priceUpdated = true;
    }

    if (subCategory && existingFabricPricingModule.subCategory !== subCategory) {
      existingFabricPricingModule.subCategory = subCategory;
      priceUpdated = true;
    }

    if (validFabricQuantityCost !== existingFabricPricingModule.price / fabricPricePerUnit) {
      existingFabricPricingModule.price = totalCost;
      existingFabricPricingModule.description = `Updated fabric pricing with new quantity cost: ${validFabricQuantityCost}`;
      priceUpdated = true;
    }

    if (priceUpdated) {
      existingFabricPricingModule.status = STATUS.ACTIVE;
    }

    // update other fields like status if provided in the DTO
    if (updatedDto.status) {
      existingFabricPricingModule.status = updatedDto.status;
    }
    const updatedFabricPricingModule = await manager
      ? manager.save(existingFabricPricingModule)
      : this.fabricPricingModuleRepository.save(existingFabricPricingModule);

    return updatedFabricPricingModule;
  }

  async updateFabricPricingStatus(id: number, newStatus: string) {
    // Retrieve fabricPricingModule and load the project and user relations
    const fabricPricingModule = await this.fabricPricingModuleRepository.findOne({
      where: { id }, // Use the fabric pricing id to fetch the module
      relations: ['project', 'project.user'], // Ensure both project and user are loaded
    });

    console.log(`Updating status for fabricPricingModule ID: ${id}`);

    // Check if fabricPricingModule exists
    if (!fabricPricingModule) {
      throw new Error(`FabricPricingModule with id ${id} not found`);
    }

    // Ensure 'project' and 'user' relations are loaded
    const project = fabricPricingModule.project;
    const user = project?.user;  // Access user from the project relation

    if (!user) {
      throw new Error(`User related to FabricPricingModule with id ${id} not found`);
    }



    const userId = user.user_id;

    // Perform action only if fabricPricingModule and newStatus are valid
    if (newStatus === 'Posted') {
      const title = MODULE_TITLES.FABRIC_PRICING;
      const description = fabricPricingModule.description || '';
      const price = fabricPricingModule.price;

      console.log(`Creating bid for fabricPricingModule ID: ${id}, userId: ${userId}`);
      // Create a new Bid
      await this.bidService.createBid(
        userId,
        fabricPricingModule.id,
        title,
        description,
        price,
        STATUS.ACTIVE,
        MODULE_TYPES.FABRIC_PRICING,
      );
    }

    // Update status
    fabricPricingModule.status = newStatus;

    // Save the updated fabricPricingModule
    await this.fabricPricingModuleRepository.save(fabricPricingModule);
  }

}

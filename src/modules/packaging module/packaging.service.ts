import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Packaging } from './entities/packaging.entity';
import { CreatePackagingDto } from './dto/create-packaging.dto';
import { PackagingBags } from '../../entities/packaging-bags.entity';
import { Project } from '../../project/entities/project.entity';
import { UpdatePackagingDto } from './dto/update-packaging.dto';
import { BidService } from '../../bid/bid.service';

@Injectable()
export class PackagingService {
  constructor(
    @InjectRepository(Packaging)
    private readonly packagingRepository: Repository<Packaging>,
    @InjectRepository(PackagingBags)
    private readonly packagingBagsRepository: Repository<PackagingBags>,
    private readonly bidService: BidService,
  ) {}

  //  Validates if the project exists.

  private async validateProject(
    manager: EntityManager,
    projectId: number,
  ): Promise<Project> {
    const project = await manager.findOne(Project, {
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(
        `Project with ID ${projectId} does not exist.`,
      );
    }

    return project;
  }

  //  Finds the packaging cost based on the quantity.
  private async findPackagingCost(
    manager: EntityManager,
    quantity: number,
  ): Promise<number> {
    const packagingBags = await manager.find(PackagingBags);

    // Find the appropriate range for the quantity
    let packagingCost = 0;
    for (const bag of packagingBags) {
      const range = bag.numberOfShirts
        .split(' to ')
        .map((str) => parseInt(str.trim()));
      const [min, max] = range;

      if (quantity >= min && quantity <= max) {
        packagingCost = bag.packagingCost;
        break;
      }
    }

    if (packagingCost === 0) {
      throw new NotFoundException(
        `No packaging cost found for quantity ${quantity}`,
      );
    }
    return packagingCost;
  }

  // Creates a new packaging module
  async createPackagingModule(
    dto: CreatePackagingDto,
    manager: EntityManager,
  ): Promise<number> {
    const project = await this.validateProject(manager, dto.projectId);

    // Calculate the packaging cost based on the quantity
    const packagingCost = await this.findPackagingCost(manager, dto.quantity);

    // Create the new packaging record
    const packaging = manager.create(Packaging, {
      project,
      quantity: dto.quantity,
      status: dto.status,
      cost: packagingCost,
    });
    // Save the packaging record in the database
    await manager.save(Packaging, packaging);

    console.log(`Packaging module: ${JSON.stringify(packaging)}`);
    return packagingCost;
  }

  async getModuleCost(projectId: number): Promise<number> {
    const packaging = await this.packagingRepository.findOne({
      where: { project: { id: projectId } },
    });

    if (!packaging) {
      return 0;
    }
    return packaging.cost;
  }



  // Edit the packaging module and recalculate the cost
  async editPackagingModule(
    projectId: number,
    updatedDto: UpdatePackagingDto,
    manager: EntityManager,
  ): Promise<Packaging> {
    const { quantity, status } = updatedDto;

    // Fetch the existing packaging module based on the projectId
    const existingPackagingModule = await this.packagingRepository.findOne({
      where: { project: { id: projectId } },
    });

    if (!existingPackagingModule) {
      throw new NotFoundException('Packaging module not found.');
    }

    // Fetch the new packaging cost based on the updated quantity
    const packagingCost = await this.findPackagingCost(manager, quantity);

    // Update the packaging record with the new data
    existingPackagingModule.quantity = quantity;
    existingPackagingModule.status = status;
    existingPackagingModule.cost = packagingCost;

    // Save the updated packaging record
    const updatedPackaging = await manager.save(Packaging, existingPackagingModule);
    return updatedPackaging;
  }

  async updatePackagingBagsStatus(id: number, newStatus: string) {
    // Retrieve the cutting module and load relations (project, user)
    const packagingModule = await this.packagingRepository.findOne({
      where: { id }, // Look up by ID
      relations: ['project', 'project.user'], // Load relations
    });

    // Check if the cutting module was found
    if (!packagingModule) {
      throw new NotFoundException(`packagingModule with ID ${id} not found.`);
    }

    // Access the related project and user
    const project = packagingModule.project;
    const user = project?.user;

    if (!user) {
      throw new NotFoundException(
        `User related to PackagingModule with ID ${id} not found.`,
      );
    }

    const userId = user.user_id; // User ID from the project relation

    // Create a bid if the status is 'Posted'
    if (newStatus === 'Posted') {
      const title = 'Packaging Module Bid';
      const description = ''; // Add description if needed
      const price = packagingModule.cost;

      // Create a new bid using the BidService
      await this.bidService.createBid(
        userId,
        packagingModule.id,
        title,
        description,
        price,
        'Active', // Status of the bid
        'PackagingModule', // Type of the module
      );
    }

    // Update the status of the cutting module
    packagingModule.status = newStatus;

    // Save the updated cutting module
    await this.packagingRepository.save(packagingModule);
  }
  
}
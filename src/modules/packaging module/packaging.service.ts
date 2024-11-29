import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Packaging } from './entities/packaging.entity';
import { CreatePackagingDto } from './dto/create-packaging.dto';
import { PackagingBags } from '../../entities/packaging-bags.entity';
import { Project } from '../../project/entities/project.entity';

@Injectable()
export class PackagingService {
  constructor(
    @InjectRepository(Packaging)
    private readonly packagingRepository: Repository<Packaging>,
    @InjectRepository(PackagingBags)
    private readonly packagingBagsRepository: Repository<PackagingBags>,
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

  // Creates a new packaging module, validates the project, and calculates the cost.
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
}
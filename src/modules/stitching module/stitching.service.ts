import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Project } from '../../project/entities/project.entity';
import { CreateStitchingDto } from './dto/create-stitching.dto';
import { UpdateStitchingDto } from './dto/update-stitchign.dto';
import { Stitching } from './entities/stitching.entity';

@Injectable()
export class StitchingService {
  constructor(
    @InjectRepository(Stitching)
    private readonly stitchingRepository: Repository<Stitching>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) { }

  // Create stitching module and calculate cost
  async createStitching(
    manager: EntityManager,
    createStitchingDto: CreateStitchingDto,
  ): Promise<number> {
    const { projectId, quantity, status } = createStitchingDto;
    const project = await manager.findOne(Project, {
      where: { id: projectId },
    });
    if (!project) {
      console.error(`Project with ID ${projectId} not found.`);
      throw new NotFoundException(`Project with ID ${projectId} not found.`);
    }

    // Fetch the rate per shirt from the stitching table
    const ratePerShirt = await this.getRateFromDb(manager, quantity);

    // Calculate the total cost
    const cost = ratePerShirt * quantity;

    // Create and save the stitching module
    const stitching = manager.create(Stitching, {
      project,
      status,
      quantity,
      ratePerShirt,
      cost,
    });

    const savedStitching = await manager.save(Stitching, stitching);
    console.log(`Saved Stitching Module: ${JSON.stringify(savedStitching)}`);
    return savedStitching.cost;
  }

  // Fetch rate per shirt from DB based on quantity
  private async getRateFromDb(
    manager: EntityManager,
    quantity: number,
  ): Promise<number> {
    // Fetch all rows and process the ranges
    const stitchingRates = await manager
      .createQueryBuilder()
      .select(['"quantityOfShirts"', '"ratePerShirt"'])
      .from('stitching', 'stitching')
      .getRawMany();

    if (!stitchingRates || stitchingRates.length === 0) {
      console.error('No rates found in stitching table.');
      throw new Error('No rates found in stitching table.');
    }

    // Find the appropriate rate based on the range
    for (const rateRow of stitchingRates) {
      const range = rateRow.quantityOfShirts;
      const [min, max] = range
        .split('-')
        .map((value) => parseInt(value.trim()));

      // Handle single-value ranges
      const effectiveMax = max || min;

      // Check if quantity falls within the range
      if (quantity >= min && quantity <= effectiveMax) {
        return rateRow.ratePerShirt;
      }
    }

    console.error(`No matching range found for quantity: ${quantity}`);
    throw new Error(
      `No matching rate found for the provided quantity: ${quantity}`,
    );
  }

  // Get module cost for a project (no manager)
  async getModuleCost(projectId: number): Promise<number> {
    const stitching = await this.stitchingRepository.findOne({
      where: { project: { id: projectId } },
    });

    if (!stitching) {
      return 0;
    }

    return stitching.cost;
  }


  // Edit an existing stitching module
  async editStitchingModule(
    projectId: number,
    updatedDto: UpdateStitchingDto,
    manager: EntityManager,
  ): Promise<Stitching> {
    const { quantity, status } = updatedDto;

    // Fetch the existing stitching module based on the projectId
    const existingStitchingModule = await this.stitchingRepository.findOne({
      where: { project: { id: projectId } },
    });

    if (!existingStitchingModule) {
      throw new NotFoundException('Stitching module not found.');
    }

    // Fetch the new rate based on the updated quantity
    const ratePerShirt = await this.getRateFromDb(manager, quantity);

    // Recalculate the total cost (rate per shirt * quantity)
    const cost = ratePerShirt * quantity;

    // Update the stitching record with the new data
    existingStitchingModule.quantity = quantity;
    existingStitchingModule.ratePerShirt = ratePerShirt;
    existingStitchingModule.cost = cost;
    existingStitchingModule.status = status;

    // Save the updated stitching record
    const updatedStitching = await manager.save(Stitching, existingStitchingModule);
    return updatedStitching;
  }

  async updateStitchingStatus(id: number, newStatus: string) {
    // Find the stitchingModule by ID
    const stitchingModule = await this.stitchingRepository.findOne({
      where: { id },
      relations: ['project', 'project.user'],
    });

    if (!stitchingModule) {
      throw new NotFoundException(`Stitching with ID ${id} not found.`);
    }

    // Update the status of the stitching module
    stitchingModule.status = newStatus;

    // Save the updated stitching module
    await this.stitchingRepository.save(stitchingModule);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Stitching } from './entities/stitching.entity';
import { CreateStitchingDto } from './dto/create-stitching.dto';
import { Project } from '../../project/entities/project.entity';

@Injectable()
export class StitchingService {
  constructor(
    @InjectRepository(Stitching)
    private readonly stitchingRepository: Repository<Stitching>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  // Create stitching module and calculate cost
  async createStitching(
    manager: EntityManager,
    createStitchingDto: CreateStitchingDto
  ): Promise<Stitching> {
    const { projectId, quantity, status } = createStitchingDto;

    console.log(`Creating stitching module...`);
    console.log(`Received Stitching DTO: ${JSON.stringify(createStitchingDto)}`);

    // Validate the project
    const project = await manager.findOne(Project, { where: { id: projectId } });
    if (!project) {
      console.error(`Project with ID ${projectId} not found.`);
      throw new NotFoundException(`Project with ID ${projectId} not found.`);
    }
    console.log(`Validated Project: ${JSON.stringify(project)}`);

    // Fetch the rate per shirt from the stitching table
    const ratePerShirt = await this.getRateFromDb(manager, quantity);
    console.log(`Fetched rate per shirt: ${ratePerShirt}`);

    // Calculate the total cost
    const cost = ratePerShirt * quantity;
    console.log(`Calculated stitching cost: ${cost}`);

    // Create and save the stitching module
    const stitching = manager.create(Stitching, {
      project,
      status,
      quantity,
      ratePerShirt,
      cost,
    });
    console.log(`Stitching data being saved: ${JSON.stringify(stitching)}`);

    const savedStitching = await manager.save(Stitching, stitching);
    console.log(`Saved Stitching Module: ${JSON.stringify(savedStitching)}`);
    return savedStitching;
  }

  // Fetch rate per shirt from DB based on quantity
  private async getRateFromDb(manager: EntityManager, quantity: number): Promise<number> {
    console.log(`Fetching rate per shirt for quantity: ${quantity}`);

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
      const range = rateRow.quantityOfShirts; // Example: '1-24', '25', or '51-99'
      const [min, max] = range.split('-').map((value) => parseInt(value.trim()));

      // Handle single-value ranges (e.g., '25')
      const effectiveMax = max || min;

      // Check if quantity falls within the range
      if (quantity >= min && quantity <= effectiveMax) {
        console.log(`Matched range: ${range} with ratePerShirt: ${rateRow.ratePerShirt}`);
        return rateRow.ratePerShirt;
      }
    }

    console.error(`No matching range found for quantity: ${quantity}`);
    throw new Error(`No matching rate found for the provided quantity: ${quantity}`);
  }

  // Get module cost for a project (no manager)
  async getModuleCost(projectId: number): Promise<number> {
    console.log(`Fetching total stitching cost for project ID: ${projectId}`);

    const stitchingModules = await this.stitchingRepository.find({
      where: { project: { id: projectId } },
    });

    if (!stitchingModules || stitchingModules.length === 0) {
      console.warn(`No stitching modules found for projectId: ${projectId}`);
      return 0;
    }

    const totalCost = stitchingModules.reduce((total, module) => total + Number(module.cost), 0);
    console.log(`Calculated total stitching cost: ${totalCost}`);
    return totalCost;
  }
}

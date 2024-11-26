// packaging.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PackagingModule } from './entities/packaging.entity';
import { Project } from '../../project/entities/project.entity';
import { PackagingBags } from '../../entities/packaging-bags.entity';

@Injectable()
export class PackagingService {
  constructor(
    @InjectRepository(PackagingModule)
    private packagingRepo: Repository<PackagingModule>,

    @InjectRepository(PackagingBags)
    private packagingBagsRepo: Repository<PackagingBags>,
  ) {}

  async createPackagingModule(projectId: number, quantity: number): Promise<PackagingModule> {
    console.log(`Creating packaging module for projectId: ${projectId}, quantity: ${quantity}`);
  
    // Fetch all ranges and their associated costs
    const packagingData = await this.packagingBagsRepo.find();
  
    if (!packagingData || packagingData.length === 0) {
      throw new Error('No packaging data found in the database.');
    }
  
    // Find the matching range for the given quantity
    let cost = null;
    for (const row of packagingData) {
      const [min, max] = row.numberOfShirts.split(' to ').map((value) => parseInt(value.trim()));
  
      // Check if the quantity falls within the range
      if (quantity >= min && quantity <= max) {
        cost = row.packagingCost;
        break;
      }
    }
  
    // If no matching range is found, throw an error
    if (cost === null) {
      throw new Error(`No packaging cost data found for quantity: ${quantity}`);
    }
  
    console.log(`Matched range found. Packaging cost: ${cost}`);
  
    // Create the PackagingModule entry
    const packagingModule = this.packagingRepo.create({
      project: { id: projectId } as Project,
      status: 'active',
      quantity: quantity,
      cost: cost,
    });
  
    // Save and return the PackagingModule entry
    return await this.packagingRepo.save(packagingModule);
  }
  

  async getModuleCost(projectId: number): Promise<number> {
    const packagingModule = await this.packagingRepo.findOne({
      where: { project: { id: projectId } },
      select: ['cost'],
    });

    return packagingModule ? packagingModule.cost : 0;
  }
}

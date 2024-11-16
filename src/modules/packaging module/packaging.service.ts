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
    // Step 1: Fetch the packaging cost from the database based on quantity
    const packagingData = await this.packagingBagsRepo.findOne({
      where: { numberOfShirts: quantity },
    });

    if (!packagingData) {
      throw new Error(`No packaging cost data found for quantity: ${quantity}`);
    }

    // Step 2: Calculate cost and create PackagingModule entity
    const packagingModule = this.packagingRepo.create({
      project: { id: projectId } as Project,
      status: 'active',
      quantity: quantity,
      cost: packagingData.packagingCost,
    });

    // Step 3: Save the PackagingModule entry
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

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FabricPricing } from './entities/fabric-pricing.entity';
import { CreateFabricPricingDto } from './dto/create-fabric-pricing.dto';
import { Project } from '../../project/entities/project.entity';

@Injectable()
export class FabricPricingService {
  constructor(
    @InjectRepository(FabricPricing)
    private readonly fabricPricingRepository: Repository<FabricPricing>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async calculateFabricCost(projectId: number): Promise<number> {
    const project = await this.projectRepository.findOne({ where: { id: projectId } });

    if (!project) {
      throw new Error(`Project with ID ${projectId} not found.`);
    }

    const fabricPricing = await this.fabricPricingRepository.findOne({
      where: {
        category: project.fabricCategory,
        subCategory: project.fabricSubCategory,
      },
    });

    if (!fabricPricing) {
      throw new Error(
        `Fabric pricing not found for category: ${project.fabricCategory} and subCategory: ${project.fabricSubCategory}.`,
      );
    }

    // Calculate cost
    const cost = Number(fabricPricing.price) * project.quantity;

    // Return the calculated cost
    return cost;
  }

  async createFabricPricing(
    projectId: number,
    dto: Partial<CreateFabricPricingDto>,
  ): Promise<FabricPricing> {
    const project = await this.projectRepository.findOne({ where: { id: projectId } });

    if (!project) {
      throw new Error(`Project with ID ${projectId} not found.`);
    }

    // Create and save the fabric pricing entry
    const fabricPricing = this.fabricPricingRepository.create({
      project,
      category: dto.category,
      subCategory: dto.subCategory || null,
      price: dto.price,
      description: dto.description || null,
    });

    return await this.fabricPricingRepository.save(fabricPricing);
  }

  // Get total cost of all FabricPricing modules linked to a project
  async getModuleCost(projectId: number): Promise<number> {
    const fabricPricings = await this.fabricPricingRepository.find({ where: { project: { id: projectId } } });

    return fabricPricings.reduce((total, pricing) => total + Number(pricing.price), 0);
  }
}

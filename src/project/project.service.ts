import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { ProjectDto } from './dto/create-project.dto';
import { FabricQuantityService } from '../modules/fabric-quantity module/fabric-quantity.service';
import { FabricPriceService } from '../modules/fabric-price module/fabric-pricing.service';
import { LogoPrintingService } from '../modules/logo-printing module/logo-printing.service';
import { CuttingService } from '../modules/cutting module/cutting.service';
import { StitchingService } from '../modules/stitching module/stitching.service';
import { PackagingService } from '../modules/packaging module/packaging.service';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project) private projectRepository: Repository<Project>,
    private fabricQuantityService: FabricQuantityService,
    private fabricPriceService: FabricPriceService,
    private logoPrintingService: LogoPrintingService,
    private cuttingService: CuttingService,
    private stitchingService: StitchingService,
    private packagingService: PackagingService,
  ) {}

  async createProject(createProjectDto: ProjectDto): Promise<Project> {
    // Step 1: Create Project entity and save it
    const project = this.projectRepository.create(createProjectDto);
    project.totalEstimatedCost = 0;
    const savedProject = await this.projectRepository.save(project);

    // Step 2: Create related modules and calculate costs
    await this.fabricQuantityService.createFabricQuantityModule(savedProject);
    await this.fabricPriceService.createFabricPriceModule(savedProject);
    await this.logoPrintingService.createLogoPrintingModule(savedProject);
    await this.cuttingService.createCuttingModule(savedProject);
    await this.stitchingService.createStitchingModule(savedProject);

    // Updated packaging module creation with projectId and quantity
    await this.packagingService.createPackagingModule(savedProject.id, savedProject.quantity);

    // Step 3: Calculate the total cost
    const totalCost = await this.calculateTotalCost(savedProject.id);
    savedProject.totalEstimatedCost = totalCost;
    return await this.projectRepository.save(savedProject);
  }

  private async calculateTotalCost(projectId: number): Promise<number> {
    // Calculate the total cost by summing up the costs of each module for the project
    const fabricQuantityCost = await this.fabricQuantityService.getModuleCost(projectId);
    const fabricPriceCost = await this.fabricPriceService.getModuleCost(projectId);
    const logoPrintingCost = await this.logoPrintingService.getModuleCost(projectId);
    const cuttingCost = await this.cuttingService.getModuleCost(projectId);
    const stitchingCost = await this.stitchingService.getModuleCost(projectId);
    const packagingCost = await this.packagingService.getModuleCost(projectId);

    return fabricQuantityCost + fabricPriceCost + logoPrintingCost + cuttingCost + stitchingCost + packagingCost;
  }


  async findOne(projectId: number): Promise<Project> {
    return this.projectRepository.findOne({ where: { id: projectId } });
  }
}

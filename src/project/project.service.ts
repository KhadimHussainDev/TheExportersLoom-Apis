import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Project } from './entities/project.entity';
import { ProjectDto } from './dto/create-project.dto';
import { FabricQuantityService } from '../modules/fabric-quantity-module/fabric-quantity.service';
import { FabricPricingService } from '../modules/fabric-price module/fabric-pricing.service';
import { LogoPrintingService } from '../modules/logo-printing module/logo-printing.service';
import { CuttingService } from '../modules/cutting module/cutting.service';
import { StitchingService } from '../modules/stitching module/stitching.service';
import { PackagingService } from '../modules/packaging module/packaging.service';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private fabricQuantityService: FabricQuantityService,
    private fabricPriceService: FabricPricingService,
    private logoPrintingService: LogoPrintingService,
    private cuttingService: CuttingService,
    private stitchingService: StitchingService,
    private packagingService: PackagingService,
    private dataSource: DataSource,
  ) {}

  async createProject(createProjectDto: ProjectDto): Promise<Project> {
    return await this.dataSource.transaction(async (manager) => {
      const project = this.projectRepository.create(createProjectDto);
      project.totalEstimatedCost = 0;

      const savedProject = await manager.save(project);

      await this.fabricQuantityService.createFabricQuantityModule(
        {
          projectId: savedProject.id,
          status: 'draft',
          categoryType: createProjectDto.fabricCategory,
          shirtType: createProjectDto.shirtType,
          fabricSize: createProjectDto.fabricSize,
          quantityRequired: createProjectDto.quantity,
        },
        manager,
      );

      await this.fabricPriceService.createFabricPricing(savedProject.id, {
        category: createProjectDto.fabricCategory,
        subCategory: createProjectDto.fabricSubCategory,
      });

      await this.logoPrintingService.createLogoPrintingModule(savedProject.id, {
        projectId: savedProject.id,
        logoPosition: createProjectDto.logoPosition,
        printingMethod: createProjectDto.printingStyle,
        logoSize: createProjectDto.logoSize,
      });

      await this.cuttingService.createCuttingModule({
        projectId: savedProject.id,
        cuttingStyle: createProjectDto.cuttingStyle as 'regular' | 'sublimation',
        quantity: createProjectDto.quantity,
      });

      await this.stitchingService.createStitching({
        projectId: savedProject.id,
        quantity: createProjectDto.quantity,
        status: 'active',
        ratePerShirt: 0, // Default; will calculate dynamically
        cost: 0,
      });

      await this.packagingService.createPackagingModule(
        savedProject.id,
        createProjectDto.quantity,
      );

      const totalCost = await this.calculateTotalCost(savedProject.id);
      savedProject.totalEstimatedCost = totalCost;

      return manager.save(savedProject);
    });
  }

  private async calculateTotalCost(projectId: number): Promise<number> {
    const fabricQuantityCost = await this.fabricQuantityService.getModuleCost(projectId);
    const fabricPriceCost = await this.fabricPriceService.getModuleCost(projectId);
    const logoPrintingCost = await this.logoPrintingService.getModuleCost(projectId);
    const cuttingCost = await this.cuttingService.getModuleCost(projectId);
    const stitchingCost = await this.stitchingService.getModuleCost(projectId);
    const packagingCost = await this.packagingService.getModuleCost(projectId);

    return (
      fabricQuantityCost +
      fabricPriceCost +
      logoPrintingCost +
      cuttingCost +
      stitchingCost +
      packagingCost
    );
  }
}

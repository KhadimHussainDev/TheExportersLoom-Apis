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
import { User } from 'users/entities/user.entity';

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
      // Step 1: Fetch the user by userId from the database
      const user = await manager.findOne(User, {
        where: { user_id: createProjectDto.userId },
      });

      // If no user found, throw an error
      if (!user) {
        throw new Error(`User with ID ${createProjectDto.userId} not found.`);
      }

      // Step 2: Create the project entity with the user linked
      const project = this.projectRepository.create({
        ...createProjectDto,
        user,
        totalEstimatedCost: 0,
      });

      // Step 3: Check if a project with the same responseId exists (or any other unique identifier)
      if (createProjectDto.responseId) {
        const existingProject = await this.projectRepository.findOne({
          where: { responseId: createProjectDto.responseId },
        });

        if (existingProject) {
          throw new Error(
            `Project with responseId ${createProjectDto.responseId} already exists.`,
          );
        }
      }
      const savedProject = await manager.save(project);
      console.log('Saved project:', savedProject);

      const { fabricQuantityCost } =
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
      console.log('Fabric Quantity Cost:', fabricQuantityCost);

      const fabricPricingCost =
        await this.fabricPriceService.createFabricPricing(
          savedProject,
          {
            category: createProjectDto.fabricCategory,
            subCategory: createProjectDto.fabricSubCategory,
            fabricQuantityCost,
          },
          manager,
        );

      console.log('Fabric Pricing COst: ', fabricPricingCost);

      const logoPrintingCost =
        await this.logoPrintingService.createLogoPrintingModule(
          savedProject.id,
          {
            projectId: savedProject.id,
            logoPosition: createProjectDto.logoPosition,
            printingMethod: createProjectDto.printingStyle,
            logoSize: createProjectDto.logoSize,
          },
          manager,
        );

      console.log('Logo Printing COst: ', logoPrintingCost);

      const cuttingCost = await this.cuttingService.createCuttingModule(
        {
          projectId: savedProject.id,
          cuttingStyle: createProjectDto.cuttingStyle as
            | 'regular'
            | 'sublimation',
          quantity: createProjectDto.quantity,
        },
        manager,
      );

      console.log('Cutting COst: ', cuttingCost);

      const stitchingCost = await this.stitchingService.createStitching(
        manager,
        {
          projectId: savedProject.id,
          quantity: createProjectDto.quantity,
          status: 'active',
          ratePerShirt: 0,
          cost: 0,
        },
      );

      console.log('Stictching COst: ', stitchingCost);

      const packagingCost = await this.packagingService.createPackagingModule(
        {
          projectId: savedProject.id,
          quantity: createProjectDto.quantity,
          status: 'active',
        },
        manager,
      );

      console.log('Packaging COst: ', packagingCost);

      const totalCost =
        fabricPricingCost +
        fabricQuantityCost +
        logoPrintingCost +
        cuttingCost +
        stitchingCost +
        packagingCost;
      console.log('Calculated total cost:', totalCost);

      savedProject.totalEstimatedCost = totalCost;

      return manager.save(savedProject);
    });
  }
}

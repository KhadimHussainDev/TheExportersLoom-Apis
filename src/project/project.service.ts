import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, Not } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { FabricQuantityService } from '../modules/fabric-quantity-module/fabric-quantity.service';
import { FabricPricingService } from '../modules/fabric-price module/fabric-pricing.service';
import { LogoPrintingService } from '../modules/logo-printing module/logo-printing.service';
import { CuttingService } from '../modules/cutting module/cutting.service';
import { StitchingService } from '../modules/stitching module/stitching.service';
import { PackagingService } from '../modules/packaging module/packaging.service';
import { User } from '../users/entities/user.entity';
import { FabricPricingModule } from 'modules/fabric-price module/entities/fabric-pricing-module.entity';
import { FabricQuantity } from 'modules/fabric-quantity-module/entities/fabric-quantity.entity';
import { Cutting } from 'modules/cutting module/entities/cutting.entity';
import { LogoPrinting } from 'modules/logo-printing module/entities/logo-printing.entity';
import { Stitching } from 'modules/stitching module/entities/stitching.entity';
import { Packaging } from 'modules/packaging module/entities/packaging.entity';
import { UpdateProjectDto } from './dto/update-project.dto';
import { FabricSizeDetailDto } from 'modules/fabric-quantity-module/dto/create-fabric-quantity.dto';  // Update path as needed

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
  ) { }

  async createProject(createProjectDto: CreateProjectDto): Promise<Project> {
    return await this.dataSource.transaction(async (manager) => {
      // Step 1: Fetch the user by userId from the database
      const user = await manager.findOne(User, {
        where: { user_id: createProjectDto.userId },
      });

      // If no user found, throw an error
      if (!user) {
        throw new Error(`User with ID ${createProjectDto.userId} not found.`);
      }

      // Calculate total quantity from sizes array
      const totalQuantity = createProjectDto.sizes.reduce(
        (sum, size) => sum + size.quantity,
        0,
      );
      console.log('Total Quantity:', totalQuantity);

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

      const { totalFabricQuantityCost } =
        await this.fabricQuantityService.createFabricQuantityModule(
          {
            projectId: savedProject.id,
            status: 'draft',
            categoryType: createProjectDto.fabricCategory,
            shirtType: createProjectDto.shirtType,
            sizes: createProjectDto.sizes?.map((size) => ({
              size: size.fabricSize,  // Fix: Using `fabricSize` from project DTO
              quantityRequired: size.quantity, // Fix: Using `quantity` from project DTO
            })) || [],
          },
          manager,
        );
      console.log('Fabric Quantity Cost:', totalFabricQuantityCost);

      const fabricPricingCost =
        await this.fabricPriceService.createFabricPricing(
          savedProject,
          {
            category: createProjectDto.fabricCategory,
            subCategory: createProjectDto.fabricSubCategory,
            fabricQuantityCost: totalFabricQuantityCost,
          },
          manager,
        );
      console.log('Fabric Pricing Cost: ', fabricPricingCost);


      // Logo Printing Module 
      // **Logo Printing Module**
      // let logoPrintingCost = 0;

      // // Check if logoDetails array exists and is not empty
      // if (createProjectDto.logoDetails?.length) {
      //   console.log('Creating Logo Printing Module with details:', createProjectDto.logoDetails);

      //   logoPrintingCost = await this.logoPrintingService.createLogoPrintingModule(
      //     savedProject.id,
      //     {
      //       projectId: savedProject.id,
      //       logoDetails: createProjectDto.logoDetails, // Pass the full logoDetails array
      //     },
      //     manager,
      //   );

      //   console.log('Logo Printing Cost:', logoPrintingCost);
      // } else {
      //   console.log('Logo printing not created (logoDetails is missing or empty).');
      // }




      const cuttingCost = await this.cuttingService.createCuttingModule(
        {
          projectId: savedProject.id,
          cuttingStyle: createProjectDto.cuttingStyle as
            | 'regular'
            | 'sublimation',
          quantity: totalQuantity,
        },
        manager,
      );
      console.log('Cutting Cost: ', cuttingCost);

      const stitchingCost = await this.stitchingService.createStitching(
        manager,
        {
          projectId: savedProject.id,
          quantity: totalQuantity,
          status: 'active',
          ratePerShirt: 0,
          cost: 0,
        },
      );

      console.log('Stictching Cost: ', stitchingCost);

      const packagingCost = await this.packagingService.createPackagingModule(
        {
          projectId: savedProject.id,
          quantity: totalQuantity,
          status: 'active',
        },
        manager,
      );

      console.log('Packaging Cost: ', packagingCost);

      const totalCost =
        fabricPricingCost +
        // logoPrintingCost +
        cuttingCost +
        stitchingCost +
        packagingCost;
      console.log('Calculated total cost:', totalCost);

      savedProject.totalEstimatedCost = totalCost;

      return manager.save(savedProject);
    });
  }

  //get all projects
  async getAllProjects(): Promise<Project[]> {
    return await this.projectRepository.find({
      where: {
        status: Not('inactive'),
      },
    });
  }

  // get a specific project by ID along its modules
  async getProjectById(id: number): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: [
        'fabricPriceModules',
        'fabricQuantities',
        'cuttings',
        'logoPrintingModules',
        'stitchingModules',
        'packagingModules'
      ],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found.`);
    }
    return project;
  }


  // Soft delete a project and its associated modules
  async deleteProject(projectId: number): Promise<string> {
    return await this.projectRepository.manager.transaction(
      async (manager: EntityManager) => {
        const project = await manager.findOne(Project, {
          where: { id: projectId },
        });

        if (!project) {
          throw new Error(`Project with ID ${projectId} not found.`);
        }
        // Soft delete the project
        project.status = 'inactive';
        await manager.save(Project, project);

        // Soft delete all related modules by updating their status
        await this.softDeleteRelatedModules(projectId, manager);

        return `Project with ID ${projectId} and its related modules have been marked as inactive->soft delete.`;
      },
    );
  }

  // Update status of related modules
  private async softDeleteRelatedModules(projectId: number, manager: EntityManager) {
    await manager.update(FabricPricingModule, { project: { id: projectId } }, { status: 'inactive' });
    await manager.update(FabricQuantity, { project: { id: projectId } }, { status: 'inactive' });
    await manager.update(Cutting, { project: { id: projectId } }, { status: 'inactive' });
    await manager.update(LogoPrinting, { project: { id: projectId } }, { status: 'inactive' });
    await manager.update(Stitching, { project: { id: projectId } }, { status: 'inactive' });
    await manager.update(Packaging, { project: { id: projectId } }, { status: 'inactive' });
  }

  // Update project 
  // async editProject(projectId: number, updateProjectDto: UpdateProjectDto): Promise<Project> {
  //   return await this.dataSource.transaction(async (manager) => {
  //     // Step 1: Fetch the existing project
  //     const project = await manager.findOne(Project, {
  //       where: { id: projectId },
  //     });

  //     if (!project) {
  //       throw new NotFoundException(`Project with ID ${projectId} not found.`);
  //     }

  //     // Step 2: Update the project fields
  //     project.status = updateProjectDto.status || project.status;
  //     project.shirtType = updateProjectDto.shirtType || project.shirtType;
  //     project.fabricCategory = updateProjectDto.fabricCategory || project.fabricCategory;
  //     project.fabricSubCategory = updateProjectDto.fabricSubCategory || project.fabricSubCategory;
  //     project.fabricSize = updateProjectDto.fabricSize || project.fabricSize;
  //     project.logoPosition = updateProjectDto.logoPosition || project.logoPosition;
  //     project.printingStyle = updateProjectDto.printingStyle || project.printingStyle;
  //     project.logoSize = updateProjectDto.logoSize || project.logoSize;
  //     project.cuttingStyle = updateProjectDto.cuttingStyle || project.cuttingStyle;
  //     project.quantity = updateProjectDto.quantity || project.quantity;

  //     // Save the updated project entity
  //     const updatedProject = await manager.save(Project, project);

  //     // Step 3: Update related modules using their respective services
  //     const { fabricQuantityCost } = await this.fabricQuantityService.editFabricQuantityModule(
  //       updatedProject.id, // Pass only the project ID
  //       {
  //         categoryType: updateProjectDto.fabricCategory,
  //         quantityRequired: updateProjectDto.quantity,
  //         status: 'draft',
  //         fabricSize: updateProjectDto.fabricSize,
  //         shirtType: updateProjectDto.shirtType,
  //       },
  //       manager,
  //     );
  //     console.log('update quantity', fabricQuantityCost);

  //     // Update Fabric Pricing module
  //     const fabricPricingModule = await this.fabricPriceService.editFabricPricingModule(
  //       updatedProject.id,
  //       {
  //         category: updateProjectDto.fabricCategory,
  //         subCategory: updateProjectDto.fabricSubCategory,
  //         fabricQuantityCost,
  //         price: 0,  // Set the price as needed
  //         description: 'Fabric pricing description',
  //       },
  //       manager,
  //     );
  //     const fabricPricingCost = Number(fabricPricingModule.price) || 0;
  //     console.log('updated fabric price', fabricPricingCost);

  //     // Update Logo Printing module
  //     let logoPrintingCostValue = 0;
  //     if (updateProjectDto.logoSize && updateProjectDto.printingStyle && updateProjectDto.logoPosition) {
  //       const logoPrintingModule = await this.logoPrintingService.editLogoPrintingModule(
  //         updatedProject.id,
  //         {
  //           projectId: updatedProject.id,
  //           printingMethod: updateProjectDto.printingStyle,
  //           logoPosition: updateProjectDto.logoPosition,
  //           logoSize: updateProjectDto.logoSize,
  //         },
  //         manager,
  //       );
  //       logoPrintingCostValue = Number(logoPrintingModule.price) || 0;
  //     }
  //     console.log('update logo price', logoPrintingCostValue);

  //     // Update Cutting module
  //     const cuttingModule = await this.cuttingService.editCuttingModule(
  //       updatedProject.id,
  //       {
  //         cuttingStyle: (updateProjectDto.cuttingStyle as 'regular' | 'sublimation'),
  //         quantity: updateProjectDto.quantity,
  //       },
  //       manager,
  //     );
  //     const cuttingCostValue = Number(cuttingModule.cost) || 0;
  //     console.log('updated cutting cost', cuttingCostValue);

  //     // Update Stitching module
  //     const stitchingModule = await this.stitchingService.editStitchingModule(
  //       updatedProject.id,
  //       {
  //         quantity: updateProjectDto.quantity,
  //         ratePerShirt: 0,
  //         cost: 0,
  //         status: 'active',
  //       },
  //       manager,
  //     );
  //     const stitchingCostValue = Number(stitchingModule.cost) || 0;
  //     console.log('update stitching module cost', stitchingCostValue);

  //     // Update Packaging module
  //     const packagingModule = await this.packagingService.editPackagingModule(
  //       updatedProject.id,
  //       {
  //         quantity: updateProjectDto.quantity,
  //         status: 'active',
  //       },
  //       manager,
  //     );
  //     const packagingCostValue = Number(packagingModule.cost) || 0;
  //     console.log('packaging cost', packagingCostValue)

  //     // Step 4: Recalculate the total cost for the project
  //     const totalCost =
  //       fabricPricingCost +
  //       logoPrintingCostValue +
  //       cuttingCostValue +
  //       stitchingCostValue +
  //       packagingCostValue;

  //     // Check if the total cost exceeds the limit for DECIMAL(15,2)
  //     const MAX_TOTAL_COST = 9999999999999.99;
  //     if (totalCost > MAX_TOTAL_COST) {
  //       console.error('Total cost exceeds the database limit!');
  //       throw new Error('Total project cost exceeds the allowed limit.');
  //     }

  //     updatedProject.totalEstimatedCost = totalCost;
  //     console.log('project cost', updatedProject.totalEstimatedCost);

  //     // Save the updated project with the new total cost
  //     await manager.save(Project, updatedProject);

  //     return updatedProject;
  //   });
  // }
}

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
      const savedProject = await manager.save(project);
      console.log('Saved project:', savedProject);

      // Fabric Quanitity Module
      const { totalFabricQuantityCost } =
        await this.fabricQuantityService.createFabricQuantityModule(
          {
            projectId: savedProject.id,
            status: 'draft',
            categoryType: createProjectDto.fabricCategory,
            shirtType: createProjectDto.shirtType,
            sizes: createProjectDto.sizes?.map((size) => ({
              size: size.fabricSize,
              quantityRequired: size.quantity,
            })) || [],
          },
          manager,
        );
      console.log('Fabric Quantity Cost:', totalFabricQuantityCost);


      // Fabric Pricing Module
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
      let logoPrintingCost = 0;
      // Check if logoDetails and sizes arrays exist and are not empty
      if (createProjectDto.logoDetails?.length && createProjectDto.sizes?.length) {
        console.log(
          `Creating Logo Printing Module for project ${savedProject.id} with details:`,
          JSON.stringify({ logoDetails: createProjectDto.logoDetails, sizes: createProjectDto.sizes }),
        );

        try {
          logoPrintingCost = await this.logoPrintingService.createLogoPrintingModule(
            savedProject.id,
            {
              projectId: savedProject.id,
              logoDetails: createProjectDto.logoDetails.map((logo) => ({
                logoPosition: logo.logoPosition,
                printingMethod: logo.PrintingStyle,
              })),
              sizes: createProjectDto.sizes?.map((size) => ({
                size: size.fabricSize,
                quantityRequired: size.quantity,
              })),
            },
            manager,
          );

          if (!logoPrintingCost) {
            console.warn('Logo Printing Module creation failed.');
          } else {
            console.log('Logo Printing Cost:', logoPrintingCost);
          }
        } catch (error) {
          console.error('Error creating Logo Printing Module:', error);
        }
      } else {
        console.log('Logo printing not created (logoDetails or sizes array is missing or empty).');
      }

      // Cutting Module
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

      // Stitching Module
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

      // Packaging Module
      let packagingCost = 0;
      if (createProjectDto.packagingRequired) {
        packagingCost = await this.packagingService.createPackagingModule(
          {
            projectId: savedProject.id,
            quantity: totalQuantity,
            status: 'active',
          },
          manager,
        );
        console.log('Packaging Cost: ', packagingCost);
      } else {
        console.log('Packaging not required; skipping Packaging Module creation.');
      }

      // Project's total cost
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

  // Update project 
  async editProject(projectId: number, updateProjectDto: UpdateProjectDto): Promise<Project> {
    return await this.dataSource.transaction(async (manager) => {
      // Step 1: Fetch the existing project
      const project = await manager.findOne(Project, {
        where: { id: projectId },
      });
      if (!project) {
        throw new NotFoundException(`Project with ID ${projectId} not found.`);
      }

      // Step 2: Update project fields with new values or keep existing ones
      project.status = updateProjectDto.status || project.status;
      project.shirtType = updateProjectDto.shirtType || project.shirtType;
      project.fabricCategory = updateProjectDto.fabricCategory || project.fabricCategory;
      project.fabricSubCategory = updateProjectDto.fabricSubCategory || project.fabricSubCategory;
      project.cuttingStyle = updateProjectDto.cuttingStyle || project.cuttingStyle;
      project.labelType = updateProjectDto.labelType || project.labelType;
      project.labelsRequired = updateProjectDto.labelsRequired || project.labelsRequired;
      project.numberOfLogos = updateProjectDto.numberOfLogos || project.numberOfLogos;
      project.packagingRequired = updateProjectDto.packagingRequired || project.packagingRequired;
      project.patternRequired = updateProjectDto.patternRequired || project.patternRequired;
      project.tagCardsRequired = updateProjectDto.tagCardsRequired || project.tagCardsRequired;

      // Calculate total quantity from sizes array
      const totalQuantity = updateProjectDto.sizes?.reduce(
        (sum, size) => sum + size.quantityRequired,
        0
      ) || 0;
      console.log('Total Quantity:', totalQuantity);

      if (updateProjectDto.sizes) {
        project.sizes = updateProjectDto.sizes.map(size => ({
          fabricSize: size.size, // Map `size` to `fabricSize`
          quantity: size.quantityRequired, // Map `quantityRequired` to `quantity`
        }));
      }
  
      // Save the updated project entity
      const updatedProject = await manager.save(Project, project);

      // Step 3: Update related modules
      // Update Fabric Quantity module
      const { totalFabricQuantityCost } = await this.fabricQuantityService.editFabricQuantityModule(
        updatedProject.id,
        {
          categoryType: updateProjectDto.fabricCategory,
          status: 'draft',
          shirtType: updateProjectDto.shirtType,
          sizes: updateProjectDto.sizes?.map((size) => ({
            size: size.size,
            quantityRequired: size.quantityRequired,
          })) || [],
        },
        manager,
      );
      console.log('Updated Fabric Quantity Cost:', totalFabricQuantityCost);

      // Update Fabric Pricing module
      const fabricPricingModule = await this.fabricPriceService.editFabricPricingModule(
        updatedProject.id,
        {
          category: updateProjectDto.fabricCategory,
          subCategory: updateProjectDto.fabricSubCategory,
          fabricQuantityCost: totalFabricQuantityCost,
          price: 0,
          description: 'Fabric pricing description',
        },
        manager,
      );
      const fabricPricingCost = Number(fabricPricingModule.price) || 0;
      console.log('Updated Fabric Pricing Cost:', fabricPricingCost);

      // Update Logo Printing module
      // let logoPrintingCostValue = 0;
      // if (updateProjectDto.logoDetails?.length) {
      //   const logoPrintingModule = await this.logoPrintingService.editLogoPrintingModule(
      //     updatedProject.id,
      //     {
      //       projectId: updatedProject.id,
      //       logoDetails: updateProjectDto.logoDetails.map((logo) => ({
      //         logoPosition: logo.logoPosition,
      //         printingStyle: logo.printingStyle, // Fixed field name
      //         logoSize: logo.logoSize, // Ensuring correct structure
      //       })),
      //       sizes: updateProjectDto.sizes?.map((size) => ({
      //         fabricSize: size.fabricSize,
      //         quantity: size.quantity,
      //       })) || [],
      //     },
      //     manager,
      //   );
      //   logoPrintingCostValue = Number(logoPrintingModule.price) || 0;
      // }
      // console.log('Updated Logo Printing Cost:', logoPrintingCostValue);

      // Update Cutting module
      const cuttingModule = await this.cuttingService.editCuttingModule(
        updatedProject.id,
        {
          cuttingStyle: updateProjectDto.cuttingStyle as 'regular' | 'sublimation',
          quantity: totalQuantity,
        },
        manager,
      );
      const cuttingCostValue = Number(cuttingModule.cost) || 0;
      console.log('Updated Cutting Cost:', cuttingCostValue);

      // Update Stitching module
      const stitchingModule = await this.stitchingService.editStitchingModule(
        updatedProject.id,
        {
          quantity: totalQuantity,
          ratePerShirt: 0,
          cost: 0,
          status: 'active',
        },
        manager,
      );
      const stitchingCostValue = Number(stitchingModule.cost) || 0;
      console.log('Updated Stitching Cost:', stitchingCostValue);

      // Update Packaging module if required
      let packagingCostValue = 0;
      if (updateProjectDto.packagingRequired) {
        const packagingModule = await this.packagingService.editPackagingModule(
          updatedProject.id,
          {
            quantity: totalQuantity,
            status: 'active',
          },
          manager,
        );
        packagingCostValue = Number(packagingModule.cost) || 0;
        console.log('Updated Packaging Cost:', packagingCostValue);
      } else {
        console.log('Packaging not required; skipping Packaging Module update.');
      }

      // Step 4: Recalculate the total cost for the project
      const totalCost =
        fabricPricingCost +
        // logoPrintingCostValue +
        cuttingCostValue +
        stitchingCostValue +
        packagingCostValue;

      // Check if the total cost exceeds the database limit for DECIMAL(15,2)
      const MAX_TOTAL_COST = 9999999999999.99;
      if (totalCost > MAX_TOTAL_COST) {
        console.error('Total cost exceeds the database limit!');
        throw new Error('Total project cost exceeds the allowed limit.');
      }

      updatedProject.totalEstimatedCost = totalCost;
      console.log('Updated Project Cost:', updatedProject.totalEstimatedCost);

      // Save the updated project with the new total cost
      await manager.save(Project, updatedProject);

      return updatedProject;
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

}

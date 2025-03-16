import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cutting } from 'modules/cutting module/entities/cutting.entity';
import { FabricPricingModule } from 'modules/fabric-price module/entities/fabric-pricing-module.entity';
import { FabricQuantity } from 'modules/fabric-quantity-module/entities/fabric-quantity.entity';
import { LogoPrinting } from 'modules/logo-printing module/entities/logo-printing.entity';
import { Packaging } from 'modules/packaging module/entities/packaging.entity';
import { Stitching } from 'modules/stitching module/entities/stitching.entity';
import { DataSource, EntityManager, Not, Repository } from 'typeorm';
import { MAX_TOTAL_COST, STATUS } from '../common';
import { CuttingService } from '../modules/cutting module/cutting.service';
import { FabricPricingService } from '../modules/fabric-price module/fabric-pricing.service';
import { FabricQuantityService } from '../modules/fabric-quantity-module/fabric-quantity.service';
import { LogoPrintingService } from '../modules/logo-printing module/logo-printing.service';
import { PackagingService } from '../modules/packaging module/packaging.service';
import { StitchingService } from '../modules/stitching module/stitching.service';
import { User } from '../users/entities/user.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';

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
    const result = await this.dataSource.transaction(async (manager) => {
      try {
        // Step 1: Fetch the user by userId from the database
        const user = await manager.findOne(User, {
          where: { user_id: createProjectDto.userId },
        });

        // If no user found, throw an error
        if (!user) {
          throw new NotFoundException(`User with ID ${createProjectDto.userId} not found.`);
        }

        // Calculate total quantity from sizes array
        const totalQuantity = createProjectDto.sizes.reduce(
          (sum, size) => sum + size.quantity,
          0,
        );

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
              status: STATUS.DRAFT,
              categoryType: createProjectDto.fabricCategory,
              shirtType: createProjectDto.shirtType,
              sizes: createProjectDto.sizes?.map((size) => ({
                size: size.size,
                quantity: size.quantity,
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
          try {
            logoPrintingCost = await this.logoPrintingService.createLogoPrintingModule(
              savedProject.id,
              {
                projectId: savedProject.id,
                logoDetails: createProjectDto.logoDetails.map((logo) => ({
                  logoPosition: logo.logoPosition,
                  printingStyle: logo.printingStyle,
                })),
                sizes: createProjectDto.sizes?.map((size) => ({
                  size: size.size,
                  quantity: size.quantity,
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
            status: STATUS.ACTIVE,
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
              status: STATUS.ACTIVE,
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
      } catch (error) {
        // If it's already a NestJS exception, rethrow it
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new Error(`Failed to create project: ${error.message}`);
      }
    });
    return this.getProjectById(result.id);
  }

  // Update project 
  async editProject(projectId: number, updateProjectDto: UpdateProjectDto): Promise<Project> {
    const result = await this.dataSource.transaction(async (manager) => {
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
      project.packagingRequired = updateProjectDto.packagingRequired;
      project.patternRequired = updateProjectDto.patternRequired || project.patternRequired;
      project.tagCardsRequired = updateProjectDto.tagCardsRequired || project.tagCardsRequired;

      // Calculate total quantity from sizes array
      const totalQuantity = updateProjectDto.sizes?.reduce(
        (sum, size) => sum + size.quantity,
        0
      ) || 0;
      console.log('Total Quantity:', totalQuantity);

      // Update Sizes
      if (updateProjectDto.sizes) {
        project.sizes = updateProjectDto.sizes.map(size => ({
          size: size.size,
          quantity: size.quantity,
        }));
      }

      // Update logoDetails 
      if (updateProjectDto.logoDetails) {
        project.logoDetails = updateProjectDto.logoDetails.map(logo => ({
          logoPosition: logo.logoPosition,
          printingStyle: logo.printingStyle,
        }));
      }

      // Update PackaagingRequired Status
      if (updateProjectDto.packagingRequired !== undefined) {
        project.packagingRequired = updateProjectDto.packagingRequired;
      }

      // Save the updated project entity
      const updatedProject = await manager.save(Project, project);

      // Step 3: Update related modules
      // Update Fabric Quantity module
      const { totalFabricQuantityCost } = await this.fabricQuantityService.editFabricQuantityModule(
        updatedProject.id,
        {
          categoryType: updateProjectDto.fabricCategory,
          status: STATUS.DRAFT,
          shirtType: updateProjectDto.shirtType,
          sizes: updateProjectDto.sizes?.map((size) => ({
            size: size.size,
            quantity: size.quantity,
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
      let logoPrintingCostValue = 0;
      const logoPrintingModule = await this.logoPrintingService.editLogoPrintingModule(
        updatedProject.id,
        {
          projectId: updatedProject.id,
          logoDetails: updateProjectDto.logoDetails?.map((logo) => ({
            logoPosition: logo.logoPosition,
            printingStyle: logo.printingStyle,
          })) || [],
          sizes: updateProjectDto.sizes?.map((size) => ({
            size: size.size,
            quantity: size.quantity,
          })) || [],
        },
        manager,
      );

      // Set cost to 0 if module is deleted (null returned)
      if (logoPrintingModule) {
        logoPrintingCostValue = Number(logoPrintingModule.price) || 0;
      } else {
        console.log(`Logo Printing module deleted for project ID ${updatedProject.id}`);
      }
      console.log('Updated Logo Printing Cost:', logoPrintingCostValue);



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
          status: STATUS.ACTIVE,
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
            status: STATUS.ACTIVE,
          },
          manager,
        );
        packagingCostValue = Number(packagingModule?.cost) || 0;
        console.log('Updated Packaging Cost:', packagingCostValue);
      } else {
        await this.packagingService.editPackagingModule(
          updatedProject.id,
          null, // Pass null to trigger removal
          manager,
        );
        console.log('Packaging removed for project:', updatedProject.id);
      }

      // Step 4: Recalculate the total cost for the project
      const totalCost =
        fabricPricingCost +
        logoPrintingCostValue +
        cuttingCostValue +
        stitchingCostValue +
        packagingCostValue;


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
    return this.getProjectById(result.id);
  }




  //get all projects
  async getAllProjects(): Promise<Project[]> {
    return await this.projectRepository.find({
      where: {
        status: Not('STATUS.INACTIVE'),

      },
      relations: ['user']
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
          throw new NotFoundException(`Project with ID ${projectId} not found.`);
        }
        // Soft delete the project
        project.status = 'STATUS.INACTIVE';
        await manager.save(Project, project);

        // Soft delete all related modules by updating their status
        await this.softDeleteRelatedModules(projectId, manager);

        return `Project with ID ${projectId} and its related modules have been marked as STATUS.INACTIVE->soft delete.`;
      },
    );
  }

  // Update status of related modules
  private async softDeleteRelatedModules(projectId: number, manager: EntityManager) {
    await manager.update(FabricPricingModule, { project: { id: projectId } }, { status: 'STATUS.INACTIVE' });
    await manager.update(FabricQuantity, { project: { id: projectId } }, { status: 'STATUS.INACTIVE' });
    await manager.update(Cutting, { project: { id: projectId } }, { status: 'STATUS.INACTIVE' });
    await manager.update(LogoPrinting, { project: { id: projectId } }, { status: 'STATUS.INACTIVE' });
    await manager.update(Stitching, { project: { id: projectId } }, { status: 'STATUS.INACTIVE' });
    await manager.update(Packaging, { project: { id: projectId } }, { status: STATUS.INACTIVE });
  }

  async getProjectsByUserId(userId: number): Promise<any[]> {
    // First check if user exists
    const user = await this.dataSource.manager.findOne(User, {
      where: { user_id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    // Get all projects for this user
    const projects = await this.projectRepository.find({
      where: { user: { user_id: userId } },
      relations: ['user', 'fabricQuantities', 'fabricPriceModules', 'logoPrintingModules', 'cuttings', 'stitchingModules', 'packagingModules'],
    });

    // Transform projects to match the format expected by the frontend
    return projects.map(project => {
      // Calculate or set default values for fields needed by ProjectCard
      let quantity = 0;
      let size = '';

      // Try to extract quantity and size from the sizes array
      if (project.sizes && project.sizes.length > 0) {
        // Sum up quantities across all sizes for total quantity
        quantity = project.sizes.reduce((total, sizeObj) => total + (sizeObj.quantity || 0), 0);

        // Format multiple sizes for the name (e.g., "3 XL + 50 S")
        const sizeText = project.sizes
          .filter(sizeObj => sizeObj.size && sizeObj.quantity > 0)
          .map(sizeObj => `${sizeObj.quantity} ${sizeObj.size}`)
          .join(' + ');

        size = sizeText;
      }

      const baseType = project.shirtType || 'Products';

      // Create a more unique name with quantity and size info
      const name = size ? `${size} ${baseType}` : baseType;

      const description = `${project.fabricCategory || ''} (${project.fabricSubCategory || ''}) project`;
      const budget = project.totalEstimatedCost || 0;

      // Count modules by status
      let completedModulesCount = 0;
      let ongoingModulesCount = 0;
      let todoModulesCount = 0;
      let totalModulesCount = 0;

      // Helper function to classify and count modules
      const countModuleStatus = (modules) => {
        if (!modules || modules.length === 0) return;

        totalModulesCount++;

        if (modules.some(m => m.status === STATUS.COMPLETED)) {
          completedModulesCount++;
        } else if (modules.some(m => m.status === STATUS.POSTED)) {
          ongoingModulesCount++;
        } else {
          todoModulesCount++;
        }
      };

      // Check all module types
      countModuleStatus(project.fabricQuantities);
      countModuleStatus(project.fabricPriceModules);
      countModuleStatus(project.logoPrintingModules);
      countModuleStatus(project.cuttings);
      countModuleStatus(project.stitchingModules);
      countModuleStatus(project.packagingModules);

      // Calculate progress percentage
      const progress = totalModulesCount > 0 ? (completedModulesCount / totalModulesCount) * 100 : 0;

      // Return only the essential fields
      return {
        id: project.id,
        name,
        description,
        budget,
        status: project.status,
        completedModules: completedModulesCount,
        ongoingModules: ongoingModulesCount,
        todoModules: todoModulesCount,
        totalModules: totalModulesCount,
        progress
      };
    });
  }

  async getProjectStatistics(): Promise<any> {
    const projects = await this.projectRepository.find();
    return this.calculateProjectStatistics(projects);
  }

  async getUserProjectStatistics(userId: number): Promise<any> {
    // First check if user exists
    const user = await this.dataSource.manager.findOne(User, {
      where: { user_id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    // Get all projects for this user with optimized data
    const userProjects = await this.getProjectsByUserId(userId);

    // Calculate project statistics
    let completed = 0;
    let active = 0;
    let pending = 0;
    let draft = 0;
    let cancelled = 0;

    // For module-level statistics
    let totalModulesCount = 0;
    let completedModulesCount = 0;
    let ongoingModulesCount = 0;
    let todoModulesCount = 0;

    userProjects.forEach(project => {
      const status = project.status ? project.status.toLowerCase() : '';

      // Project status statistics
      if (status.includes('complete')) {
        completed++;
      } else if (status.includes('active')) {
        active++;
      } else if (status.includes('pending')) {
        pending++;
      } else if (status.includes('draft')) {
        draft++;
      } else if (status.includes('cancel')) {
        cancelled++;
      }

      // Module statistics - directly use the categorized modules
      totalModulesCount += project.totalModules || 0;
      completedModulesCount += project.completedModules || 0;
      ongoingModulesCount += project.ongoingModules || 0;
      todoModulesCount += project.todoModules || 0;
    });

    const total = userProjects.length;

    // Calculate percentages for project pie chart
    const completedPercentage = total > 0 ? (completed / total) * 100 : 0;
    const ongoingPercentage = total > 0 ? ((active + pending) / total) * 100 : 0;
    const todoPercentage = total > 0 ? ((draft + cancelled) / total) * 100 : 0;

    // Calculate percentages for module pie chart
    const moduleCompletedPercentage = totalModulesCount > 0 ? (completedModulesCount / totalModulesCount) * 100 : 0;
    const moduleOngoingPercentage = totalModulesCount > 0 ? (ongoingModulesCount / totalModulesCount) * 100 : 0;
    const moduleTodoPercentage = totalModulesCount > 0 ? (todoModulesCount / totalModulesCount) * 100 : 0;

    return {
      // Project-level statistics
      projectCompletedPercentage: completedPercentage,
      projectOngoingPercentage: ongoingPercentage,
      projectTodoPercentage: todoPercentage,
      totalProjects: total,
      completedProjects: completed,
      ongoingProjects: active + pending,
      todoProjects: draft + cancelled,

      // Module-level statistics
      completedPercentage: moduleCompletedPercentage,
      ongoingPercentage: moduleOngoingPercentage,
      todoPercentage: moduleTodoPercentage,
      total: totalModulesCount,
      completed: completedModulesCount,
      ongoing: ongoingModulesCount,
      todo: todoModulesCount,

      // Additional detailed stats
      active,
      pending,
      draft,
      cancelled
    };
  }

  private calculateProjectStatistics(projects: Project[]): any {
    let completed = 0;
    let active = 0;
    let pending = 0;
    let draft = 0;
    let cancelled = 0;

    projects.forEach(project => {
      switch (project.status) {
        case STATUS.COMPLETED:
          completed++;
          break;
        case STATUS.ACTIVE:
          active++;
          break;
        case STATUS.PENDING:
          pending++;
          break;
        case STATUS.DRAFT:
          draft++;
          break;
        case STATUS.CANCELLED:
          cancelled++;
          break;
        default:
          break;
      }
    });

    const total = projects.length;

    // Calculate percentages for pie chart
    const completedPercentage = total > 0 ? (completed / total) * 100 : 0;
    const ongoingPercentage = total > 0 ? ((active + pending) / total) * 100 : 0;
    const todoPercentage = total > 0 ? ((draft + cancelled) / total) * 100 : 0;

    return {
      completedPercentage,
      ongoingPercentage,
      todoPercentage,
      total,
      completed,
      ongoing: active + pending,
      todo: draft + cancelled,
      // Additional detailed stats
      active,
      pending,
      draft,
      cancelled
    };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { BidService } from '../../bid/bid.service';
import { DEFAULT_DESCRIPTIONS, MODULE_TITLES, SIZE_MAPPINGS } from '../../common';
import { LogoSizes } from '../../entities/logo-sizes.entity';
import { Project } from '../../project/entities/project.entity';
import { CreateLogoPrintingDto } from './dto/create-logo-printing.dto';
import { UpdateLogoPrintingDto } from './dto/update-logo-printing.dto';
import { LogoPrinting } from './entities/logo-printing.entity';

@Injectable()
export class LogoPrintingService {
  private readonly tableMap: Record<string, string> = {
    'bottom hem': 'bottom_hem',
    'center chest': 'center_chest',
    'full back': 'full_back',
    'full front': 'full_front',
    'left chest': 'left_chest',
    'oversized front': 'oversized_front',
    sleeves: 'sleeves',
    'upper back': 'upper_back',
  };

  constructor(
    @InjectRepository(LogoPrinting)
    private readonly logoPrintingRepository: Repository<LogoPrinting>,
    private readonly dataSource: DataSource,
    private readonly bidService: BidService,
  ) { }

  // Method to get the size column based on logoPosition and required size
  public async getSizeColumn(
    manager: EntityManager,
    position: string,
    requiredSize: string,
  ): Promise<string> {
    // Normalize position (to handle case differences)
    const normalizedPosition = position.trim().toLowerCase();

    // Fetch logo sizes for the given position
    const logoSizeData = await manager
      .createQueryBuilder()
      .select([
        `"smallSize"`,
        `"mediumSize"`,
        `"largeSize"`,
        `"xlSize"`
      ])
      .from(LogoSizes, 'logo_sizes')
      .where('LOWER(logo_sizes."logoPosition") = LOWER(:position)', { position: normalizedPosition })
      .getRawOne();

    if (!logoSizeData) {
      throw new NotFoundException(`Logo position "${position}" not found`);
    }
    // Normalize requiredSize to match database values
    const normalizedSize = requiredSize.trim().toLowerCase();
    const sizeColumnKey = SIZE_MAPPINGS[normalizedSize];

    if (!sizeColumnKey) {
      throw new NotFoundException(
        `No matching size column found for required size: ${requiredSize}`,
      );
    }

    // Retrieve the value from the mapped column
    const rawSizeValue = logoSizeData[sizeColumnKey];

    if (!rawSizeValue) {
      throw new NotFoundException(
        `No value found for size column key: ${sizeColumnKey}`,
      );
    }

    // Convert "7 x 7" → "size7x7"
    const formattedSizeColumn = `size${rawSizeValue.replace(/\s/g, '').replace(/\./g, '_')}`;
    return formattedSizeColumn;
  }

  public async getCostByPositionAndSize(
    manager: EntityManager,
    position: string,
    sizeColumn: string,
    printingMethod: string,
  ): Promise<number> {
    // Get table name based on position
    const tableName = this.tableMap[position.toLowerCase()];
    if (!tableName) {
      throw new NotFoundException(`Invalid logo position: ${position}`);
    }
    // console.log(`Fetching cost from ${tableName}, column: ${sizeColumn}, method: ${printingMethod}`);

    const result = await manager
      .createQueryBuilder()
      .select(`"${sizeColumn}"`)
      .from(tableName, tableName)
      .where('"printingMethod" = :printingMethod', { printingMethod })
      .getRawOne();

    if (!result || !result[sizeColumn]) {
      throw new NotFoundException(
        `Cost not available for position: ${position}, size: ${sizeColumn}, method: ${printingMethod}`,
      );
    }

    return this.calculateMeanCost(result[sizeColumn]);
  }


  public calculateMeanCost(range: string): number {
    const [min, max] = range
      .split('-')
      .map((value) => parseFloat(value.trim()));

    if (isNaN(min) || isNaN(max)) {
      throw new NotFoundException(`Invalid cost range: ${range}`);
    }
    return (min + max) / 2;
  }


  // Validate if the projectId exists in the database
  private async validateProject(
    manager: EntityManager,
    projectId: number,
  ): Promise<void> {
    const projectExists = await manager
      .createQueryBuilder()
      .select('project.id')
      .from(Project, 'project')
      .where('project.id = :projectId', { projectId })
      .getRawOne();

    if (!projectExists) {
      throw new NotFoundException(
        `Project with ID ${projectId} does not exist.`,
      );
    }
  }

  // Core function to create the logo printing module
  public async createLogoPrintingModule(
    projectId: number,
    dto: CreateLogoPrintingDto,
    manager: EntityManager,
  ): Promise<number> {
    await this.validateProject(manager, projectId);

    let totalCost = 0;
    for (const sizeData of dto.sizes) {
      const { size: requiredSize } = sizeData;

      for (const logo of dto.logoDetails) {
        const { logoPosition, printingMethod } = logo;
        const sizeColumn = await this.getSizeColumn(manager, logoPosition, requiredSize);

        if (!sizeColumn) {
          throw new NotFoundException(`Invalid size mapping for ${requiredSize} at position ${logoPosition}`);
        }
        const cost = await this.getCostByPositionAndSize(manager, logoPosition, sizeColumn, printingMethod);
        totalCost += cost;
      }
    }

    console.log('Final Total Cost:', totalCost);

    // Create and save the logo printing module
    const logoPrinting = manager.create(LogoPrinting, {
      projectId,
      sizes: dto.sizes,
      price: totalCost,
      status: 'draft',
      logoDetails: dto.logoDetails,

    });

    const savedLogoPrinting = await manager.save(LogoPrinting, logoPrinting);
    return savedLogoPrinting.price;
  }


  //  Fetch the total cost of the logo printing module for a project
  async getModuleCost(projectId: number): Promise<number> {
    const logoPrinting = await this.logoPrintingRepository.findOne({
      where: { projectId },
    });

    return logoPrinting?.price || 0;
  }

  // Edit the logo printing module for a project.
  public async editLogoPrintingModule(
    projectId: number,
    updatedDto: UpdateLogoPrintingDto,
    manager: EntityManager,
  ): Promise<LogoPrinting> {
    // Validate project existence
    await this.validateProject(manager, projectId);

    // Fetch existing logo printing module
    let existingLogoPrintingModule = await this.logoPrintingRepository.findOne({
      where: { projectId },
    });

    // **DELETE MODULE IF logoDetails IS EMPTY**
    if (!updatedDto.logoDetails || updatedDto.logoDetails.length === 0) {
      if (existingLogoPrintingModule) {
        await manager.remove(existingLogoPrintingModule);
        console.log(`Deleted Logo Printing module for project ID ${projectId}`);
      }
      return null;
    }

    let totalCost = 0;

    for (const sizeData of updatedDto.sizes) {
      const { size: requiredSize } = sizeData;

      for (const logo of updatedDto.logoDetails) {
        const { logoPosition, printingMethod } = logo;

        // Retrieve size column based on position and required size
        const sizeColumn = await this.getSizeColumn(manager, logoPosition, requiredSize);

        if (!sizeColumn) {
          throw new NotFoundException(`Invalid size mapping for ${requiredSize} at position ${logoPosition}`);
        }

        // Fetch cost based on position, size, and printing method
        const cost = await this.getCostByPositionAndSize(manager, logoPosition, sizeColumn, printingMethod);
        totalCost += cost;
      }
    }

    if (existingLogoPrintingModule) {
      // Check if any updates are required
      const isLogoDetailsChanged =
        JSON.stringify(existingLogoPrintingModule.logoDetails) !== JSON.stringify(updatedDto.logoDetails);
      const isSizesChanged =
        JSON.stringify(existingLogoPrintingModule.sizes) !== JSON.stringify(updatedDto.sizes);
      const isPriceChanged = existingLogoPrintingModule.price !== totalCost;

      if (isLogoDetailsChanged || isSizesChanged || isPriceChanged) {
        // Update the module
        existingLogoPrintingModule.logoDetails = updatedDto.logoDetails;
        existingLogoPrintingModule.sizes = updatedDto.sizes;
        existingLogoPrintingModule.price = totalCost;
        existingLogoPrintingModule.status = 'draft';

        // Save the updated module
        return manager.save(existingLogoPrintingModule);
      } else {
        // No change detected, return the existing module
        return existingLogoPrintingModule;
      }
    } else {
      // If module does not exist, create a new one
      const newLogoPrinting = manager.create(LogoPrinting, {
        projectId,
        logoDetails: updatedDto.logoDetails,
        sizes: updatedDto.sizes,
        price: totalCost,
        status: 'draft',
      });

      // Save and return the new logo printing module
      return manager.save(newLogoPrinting);
    }
  }


  async updateLogoPrintingStatus(id: number, newStatus: string) {
    // Retrieve the cutting module and load relations (project, user)
    const logoPrintingModule = await this.logoPrintingRepository.findOne({
      where: { id },
      relations: ['project', 'project.user'],
    });

    // Check if the cutting module was found
    if (!logoPrintingModule) {
      throw new NotFoundException(
        `logoPrintingModule with ID ${id} not found.`,
      );
    }

    // Access the related project and user
    const project = logoPrintingModule.project;
    const user = project?.user;

    if (!user) {
      throw new NotFoundException(
        `User related to logoPrintingModule with ID ${id} not found.`,
      );
    }

    const userId = user.user_id;

    // Create a bid if the status is 'Posted'
    if (newStatus === 'Posted') {
      const title = MODULE_TITLES.LOGO_PRINTING;
      const description = DEFAULT_DESCRIPTIONS.EMPTY;
      const price = logoPrintingModule.price;

      // Create a new bid using the BidService
      await this.bidService.createBid(
        userId,
        logoPrintingModule.id,
        title,
        description,
        price,
        'Active',
        'LogoPrintingModule',
      );
    }

    // Update the status of the cutting module
    logoPrintingModule.status = newStatus;

    await this.logoPrintingRepository.save(logoPrintingModule);
  }
}

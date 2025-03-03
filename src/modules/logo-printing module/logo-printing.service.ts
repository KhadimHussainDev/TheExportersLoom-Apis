import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { LogoPrinting } from './entities/logo-printing.entity';
import { CreateLogoPrintingDto } from './dto/create-logo-printing.dto';
import { Project } from '../../project/entities/project.entity';
import { BidService } from '../../bid/bid.service';
import { LogoSizes } from '../../entities/logo-sizes.entity';
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
      throw new NotFoundException(
        `No size mapping found for logo position: ${position}`,
      );
    }
    // Normalize requiredSize to match database values
    const sizeMapping = {
      's': 'smallSize', 'small': 'smallSize',
      'm': 'mediumSize', 'medium': 'mediumSize',
      'l': 'largeSize', 'large': 'largeSize',
      'xl': 'xlSize', 'extra large': 'xlSize', 'extralarge': 'xlSize'
    };

    const normalizedSize = requiredSize.trim().toLowerCase();
    const sizeColumnKey = sizeMapping[normalizedSize];

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
    const formattedSizeColumn = `size${rawSizeValue.replace(/\s/g, '')}`;
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
    console.log(`Fetching cost from ${tableName}, column: ${sizeColumn}, method: ${printingMethod}`);

    const result = await manager
      .createQueryBuilder()
      .select(sizeColumn)
      .from(tableName, tableName)
      .where('"printingMethod" = :printingMethod', { printingMethod }) 
      .getRawOne();

    if (!result || !result[sizeColumn]) {
      throw new NotFoundException(
        `Cost not available for position: ${position}, size: ${sizeColumn}, method: ${printingMethod}`,
      );
    }
    console.log('Retrieved Cost:', result[sizeColumn]);
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
  // public async editLogoPrintingModule(
  //   projectId: number,
  //   updatedDto: UpdateLogoPrintingDto,
  //   manager: EntityManager,
  // ): Promise<LogoPrinting> {
  //   const { logoPosition, printingMethod, logoSize } = updatedDto;

  //   // Check if a logo printing module exists for this project
  //   let existingLogoPrintingModule = await this.logoPrintingRepository.findOne({
  //     where: { projectId },
  //   });

  //   if (existingLogoPrintingModule) {
  //     // If module exists, check if any fields have changed
  //     let priceUpdated = false;

  //     if (
  //       existingLogoPrintingModule.logoPosition !== logoPosition ||
  //       existingLogoPrintingModule.printingMethod !== printingMethod ||
  //       existingLogoPrintingModule.size !== logoSize
  //     ) {
  //       // Recalculate cost if any field changed
  //       const sizeColumn = this.getSizeColumn(logoSize);
  //       if (!sizeColumn) {
  //         throw new NotFoundException(`Invalid logo size: ${logoSize}`);
  //       }

  //       const cost = await this.getCostByPositionAndSize(
  //         manager,
  //         logoPosition,
  //         sizeColumn,
  //         printingMethod,
  //       );

  //       // Update price only if it changes
  //       if (existingLogoPrintingModule.price !== cost) {
  //         existingLogoPrintingModule.price = cost;
  //         priceUpdated = true;
  //       }
  //     }

  //     // Update other fields if necessary
  //     if (existingLogoPrintingModule.logoPosition !== logoPosition) {
  //       existingLogoPrintingModule.logoPosition = logoPosition;
  //     }

  //     if (existingLogoPrintingModule.printingMethod !== printingMethod) {
  //       existingLogoPrintingModule.printingMethod = printingMethod;
  //     }

  //     if (existingLogoPrintingModule.size !== logoSize) {
  //       existingLogoPrintingModule.size = logoSize;
  //     }

  //     // Update status if needed
  //     existingLogoPrintingModule.status = 'draft';

  //     // Save the updated module only if there is any change
  //     if (priceUpdated) {
  //       console.log(
  //         `Saving updated logo printing module with new price: ${existingLogoPrintingModule.price}`,
  //       );
  //       return manager.save(existingLogoPrintingModule);
  //     } else {
  //       console.log(`No change in price, no save needed`);
  //       return existingLogoPrintingModule;
  //     }
  //   } else {
  //     // If no logo module exists, create a new one
  //     const sizeColumn = this.getSizeColumn(logoSize);
  //     if (!sizeColumn) {
  //       throw new NotFoundException(`Invalid logo size: ${logoSize}`);
  //     }

  //     // Recalculate the cost
  //     const cost = await this.getCostByPositionAndSize(
  //       manager,
  //       logoPosition,
  //       sizeColumn,
  //       printingMethod,
  //     );

  //     // Create a new logo printing module
  //     const logoPrinting = manager.create(LogoPrinting, {
  //       projectId,
  //       printingMethod,
  //       logoPosition,
  //       size: logoSize,
  //       price: cost,
  //       status: 'draft',
  //     });

  //     // Save the new module
  //     return manager.save(logoPrinting);
  //   }
  // }

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
      const title = 'Logo Priniting Module Bid';
      const description = ''; 
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

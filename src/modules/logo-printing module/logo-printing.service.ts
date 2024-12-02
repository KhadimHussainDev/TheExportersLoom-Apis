import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { LogoPrinting } from './entities/logo-printing.entity';
import { CreateLogoPrintingDto } from './dto/create-logo-printing.dto';
import { Project } from '../../project/entities/project.entity';
import { UpdateLogoPrintingDto } from './dto/update-logo-printing.dto';
import { BidService } from '../../bid/bid.service';

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
  ) {}

  // Normalize and map size to the corresponding database column name.
  public getSizeColumn(size: string): string {
    const sizeMap = {
      '2.5 x 2.5 inches': 'size2_5x2_5',
      '3 x 3 inches': 'size3x3',
      '3.5 x 3.5 inches': 'size3_5x3_5',
      '4 x 4 inches': 'size4x4',
      '5 x 5 inches': 'size5x5',
      '6 x 6 inches': 'size6x6',
      '7 x 7 inches': 'size7x7',
      '8 x 8 inches': 'size8x8',
      '10 x 12 inches': 'size10x12',
      '12 x 14 inches': 'size12x14',
      '14 x 16 inches': 'size14x16',
      '16 x 18 inches': 'size16x18',
    };
    const normalizedSize =
      size.trim().toLowerCase().replace('x', ' x ') + ' inches';
    const sizeColumn = sizeMap[normalizedSize] || null;
    return sizeColumn;
  }

  // Calculate the mean cost from a range string (e.g., "300 - 600").
  private calculateMeanCost(range: string): number {
    const [min, max] = range
      .split('-')
      .map((value) => parseFloat(value.trim()));
    if (isNaN(min) || isNaN(max)) {
      console.error(`Invalid cost range: '${range}'`);
      throw new NotFoundException(`Invalid cost range: ${range}`);
    }
    const meanCost = (min + max) / 2;
    return meanCost;
  }

  // Fetch the cost dynamically based on position, size, and printing method.
  public async getCostByPositionAndSize(
    manager: EntityManager,
    position: string,
    sizeColumn: string,
    printingMethod: string,
  ): Promise<number> {
    const tableName = this.tableMap[position.toLowerCase()];
    if (!tableName) {
      console.error(`Invalid logo position: '${position}'`);
      throw new NotFoundException(`Invalid logo position: ${position}`);
    }

    const query = manager
      .createQueryBuilder()
      .select(sizeColumn)
      .from(tableName, tableName)
      .where('"printingMethod" = :printingMethod', { printingMethod });

    const result = await query.getRawOne();

    if (!result || !result[sizeColumn]) {
      console.error(
        `Cost not available for position: '${position}', size: '${sizeColumn}', and method: '${printingMethod}'`,
      );
      throw new NotFoundException(
        `Cost not available for position: ${position}, size: ${sizeColumn}, and method: ${printingMethod}`,
      );
    }
    return this.calculateMeanCost(result[sizeColumn]);
  }

  // Validate if the projectId exists in the database using EntityManager.
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
      console.error(`Project with ID ${projectId} does not exist.`);
      throw new NotFoundException(
        `Project with ID ${projectId} does not exist.`,
      );
    }
  }

  // Create a logo printing module for a project.
  public async createLogoPrintingModule(
    projectId: number,
    dto: CreateLogoPrintingDto,
    manager: EntityManager, // Accept EntityManager for transaction
  ): Promise<number> {
    // Validate the projectId before proceeding
    await this.validateProject(manager, projectId);

    // Get the corresponding size column
    const sizeColumn = this.getSizeColumn(dto.logoSize);
    if (!sizeColumn) {
      console.error(`Invalid logo size: '${dto.logoSize}'`);
      throw new NotFoundException(`Invalid logo size: ${dto.logoSize}`);
    }

    // Fetch the cost dynamically
    const cost = await this.getCostByPositionAndSize(
      manager,
      dto.logoPosition,
      sizeColumn,
      dto.printingMethod,
    );

    // Create the logo printing module
    const logoPrinting = manager.create(LogoPrinting, {
      projectId,
      printingMethod: dto.printingMethod,
      size: dto.logoSize,
      logoPosition: dto.logoPosition,
      price: cost,
      status: 'draft',
    });
    const savedLogoPrinting = await manager.save(LogoPrinting, logoPrinting);
    console.log(
      `Saving logo printing module: ${JSON.stringify(savedLogoPrinting)}`,
    );
    return savedLogoPrinting.price;
  }

  async getModuleCost(projectId: number): Promise<number> {
    const logoPrinting = await this.logoPrintingRepository.findOne({
      where: { projectId },
    });

    if (!logoPrinting) {
      return 0;
    }

    return logoPrinting.price || 0;
  }

  // Edit the logo printing module for a project.
  public async editLogoPrintingModule(
    projectId: number,
    updatedDto: UpdateLogoPrintingDto,
    manager: EntityManager,
  ): Promise<LogoPrinting> {
    const { logoPosition, printingMethod, logoSize } = updatedDto;

    // Check if a logo printing module exists for this project
    let existingLogoPrintingModule = await this.logoPrintingRepository.findOne({
      where: { projectId },
    });

    if (existingLogoPrintingModule) {
      // If module exists, check if any fields have changed
      let priceUpdated = false;

      if (
        existingLogoPrintingModule.logoPosition !== logoPosition ||
        existingLogoPrintingModule.printingMethod !== printingMethod ||
        existingLogoPrintingModule.size !== logoSize
      ) {
        // Recalculate cost if any field changed
        const sizeColumn = this.getSizeColumn(logoSize);
        if (!sizeColumn) {
          throw new NotFoundException(`Invalid logo size: ${logoSize}`);
        }

        const cost = await this.getCostByPositionAndSize(
          manager,
          logoPosition,
          sizeColumn,
          printingMethod,
        );

        // Update price only if it changes
        if (existingLogoPrintingModule.price !== cost) {
          existingLogoPrintingModule.price = cost;
          priceUpdated = true;
        }
      }

      // Update other fields if necessary
      if (existingLogoPrintingModule.logoPosition !== logoPosition) {
        existingLogoPrintingModule.logoPosition = logoPosition;
      }

      if (existingLogoPrintingModule.printingMethod !== printingMethod) {
        existingLogoPrintingModule.printingMethod = printingMethod;
      }

      if (existingLogoPrintingModule.size !== logoSize) {
        existingLogoPrintingModule.size = logoSize;
      }

      // Update status if needed
      existingLogoPrintingModule.status = 'draft';

      // Save the updated module only if there is any change
      if (priceUpdated) {
        console.log(
          `Saving updated logo printing module with new price: ${existingLogoPrintingModule.price}`,
        );
        return manager.save(existingLogoPrintingModule);
      } else {
        console.log(`No change in price, no save needed`);
        return existingLogoPrintingModule;
      }
    } else {
      // If no logo module exists, create a new one
      const sizeColumn = this.getSizeColumn(logoSize);
      if (!sizeColumn) {
        throw new NotFoundException(`Invalid logo size: ${logoSize}`);
      }

      // Recalculate the cost
      const cost = await this.getCostByPositionAndSize(
        manager,
        logoPosition,
        sizeColumn,
        printingMethod,
      );

      // Create a new logo printing module
      const logoPrinting = manager.create(LogoPrinting, {
        projectId,
        printingMethod,
        logoPosition,
        size: logoSize,
        price: cost,
        status: 'draft',
      });

      // Save the new module
      return manager.save(logoPrinting);
    }
  }

  async updateLogoPrintingStatus(id: number, newStatus: string) {
    // Retrieve the cutting module and load relations (project, user)
    const logoPrintingModule = await this.logoPrintingRepository.findOne({
      where: { id }, // Look up by ID
      relations: ['project', 'project.user'], // Load relations
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

    const userId = user.user_id; // User ID from the project relation

    // Create a bid if the status is 'Posted'
    if (newStatus === 'Posted') {
      const title = 'Logo Priniting Module Bid';
      const description = ''; // Add description if needed
      const price = logoPrintingModule.price;

      // Create a new bid using the BidService
      await this.bidService.createBid(
        userId,
        logoPrintingModule.id,
        title,
        description,
        price,
        'Active', // Status of the bid
        'LogoPrintingModule', // Type of the module
      );
    }

    // Update the status of the cutting module
    logoPrintingModule.status = newStatus;

    // Save the updated cutting module
    await this.logoPrintingRepository.save(logoPrintingModule);
  }
}

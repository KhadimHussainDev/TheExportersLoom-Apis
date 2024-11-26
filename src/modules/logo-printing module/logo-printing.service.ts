import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { LogoPrinting } from './entities/logo-printing.entity';
import { CreateLogoPrintingDto } from './dto/create-logo-printing.dto';
import { Project } from '../../project/entities/project.entity';

@Injectable()
export class LogoPrintingService {
  private readonly tableMap: Record<string, string> = {
    'bottom hem': 'bottom_hem',
    'center chest': 'center_chest',
    'full back': 'full_back',
    'full front': 'full_front',
    'left chest': 'left_chest',
    'oversized front': 'oversized_front',
    'sleeves': 'sleeves',
    'upper back': 'upper_back',
  };

  constructor(
    @InjectRepository(LogoPrinting)
    private readonly logoPrintingRepository: Repository<LogoPrinting>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Normalize and map size to the corresponding database column name.
   */
  public getSizeColumn(size: string): string {
    console.log(`Mapping logo size: '${size}'`);
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
    const normalizedSize = size.trim().toLowerCase().replace('x', ' x ') + ' inches';
    const sizeColumn = sizeMap[normalizedSize] || null;
    console.log(`Mapped size: '${normalizedSize}' to column: '${sizeColumn}'`);
    return sizeColumn;
  }

  /**
   * Calculate the mean cost from a range string (e.g., "300 - 600").
   */
  private calculateMeanCost(range: string): number {
    console.log(`Calculating mean cost for range: '${range}'`);
    const [min, max] = range.split('-').map((value) => parseFloat(value.trim()));
    if (isNaN(min) || isNaN(max)) {
      console.error(`Invalid cost range: '${range}'`);
      throw new NotFoundException(`Invalid cost range: ${range}`);
    }
    const meanCost = (min + max) / 2;
    console.log(`Calculated mean cost: ${meanCost}`);
    return meanCost;
  }

  /**
   * Fetch the cost dynamically based on position, size, and printing method.
   */
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

    console.log(
      `Fetching cost from table: '${tableName}', column: '${sizeColumn}', printingMethod: '${printingMethod}'`,
    );

    const query = manager
      .createQueryBuilder()
      .select(sizeColumn)
      .from(tableName, tableName)
      .where('"printingMethod" = :printingMethod', { printingMethod });

    console.log(`Generated SQL query: ${query.getSql()}`);

    const result = await query.getRawOne();

    if (!result || !result[sizeColumn]) {
      console.error(
        `Cost not available for position: '${position}', size: '${sizeColumn}', and method: '${printingMethod}'`,
      );
      throw new NotFoundException(
        `Cost not available for position: ${position}, size: ${sizeColumn}, and method: ${printingMethod}`,
      );
    }

    console.log(`Fetched cost range: '${result[sizeColumn]}'`);
    return this.calculateMeanCost(result[sizeColumn]);
  }

  /**
   * Validate if the projectId exists in the database using EntityManager.
   */
  private async validateProject(manager: EntityManager, projectId: number): Promise<void> {
    console.log(`Validating projectId: ${projectId}`);
    const projectExists = await manager
      .createQueryBuilder()
      .select('project.id')
      .from(Project, 'project')
      .where('project.id = :projectId', { projectId })
      .getRawOne();

    if (!projectExists) {
      console.error(`Project with ID ${projectId} does not exist.`);
      throw new NotFoundException(`Project with ID ${projectId} does not exist.`);
    }
    console.log(`Project with ID ${projectId} validated.`);
  }

  /**
   * Create a logo printing module for a project.
   */
  public async createLogoPrintingModule(
    projectId: number,
    dto: CreateLogoPrintingDto,
    manager: EntityManager, // Accept EntityManager for transaction
  ): Promise<LogoPrinting> {
    console.log(
      `Creating logo printing module for projectId: '${projectId}', position: '${dto.logoPosition}', method: '${dto.printingMethod}', size: '${dto.logoSize}'`,
    );

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

    console.log(`Calculated cost for logo printing: ${cost}`);

    // Create the logo printing module
    const logoPrinting = manager.create(LogoPrinting, {
      projectId,
      printingMethod: dto.printingMethod,
      size: dto.logoSize,
      logoPosition: dto.logoPosition,
      price: cost,
    });

    console.log(`Saving logo printing module: ${JSON.stringify(logoPrinting)}`);
    return manager.save(LogoPrinting, logoPrinting);
  }

  /**
   * Get the total cost of all logo printing modules for a project.
   */
  public async getModuleCost(
    managerOrProjectId: EntityManager | number,
    projectId?: number,
  ): Promise<number> {
    let manager: EntityManager;
    let resolvedProjectId: number;
  
    if (managerOrProjectId instanceof EntityManager) {
      manager = managerOrProjectId;
      resolvedProjectId = projectId;
    } else {
      // If EntityManager is not passed, use DataSource's default EntityManager
      manager = this.dataSource.createEntityManager();
      resolvedProjectId = managerOrProjectId;
    }
  
    console.log(
      `Fetching total cost for all logo printing modules for projectId: '${resolvedProjectId}'`,
    );
  
    const modules = await manager.find(LogoPrinting, {
      where: { projectId: resolvedProjectId },
      select: ['price'],
    });
  
    if (!modules || modules.length === 0) {
      console.warn(`No logo printing modules found for projectId: '${resolvedProjectId}'`);
      return 0;
    }
  
    const totalCost = modules.reduce((total, module) => total + Number(module.price), 0);
    console.log(`Calculated total cost for projectId: '${resolvedProjectId}': ${totalCost}`);
    return totalCost;
  }
  
}

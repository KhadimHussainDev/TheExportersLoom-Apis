import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { LogoPrinting } from './entities/logo-printing.entity';
import { CreateLogoPrintingDto } from './dto/create-logo-printing.dto';

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
    private readonly dataSource: DataSource, // Use DataSource for dynamic table queries
  ) {}

  // Map sizes to corresponding database columns
  private getSizeColumn(size: string): string {
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
    return sizeMap[size.toLowerCase()] || null;
  }

  // Calculate the mean cost from a range string (e.g., "300 - 600")
  private calculateMeanCost(range: string): number {
    const [min, max] = range.split('-').map((value) => parseFloat(value.trim()));
    if (isNaN(min) || isNaN(max)) {
      throw new NotFoundException(`Invalid cost range: ${range}`);
    }
    return (min + max) / 2;
  }

  // Fetch cost dynamically from a table based on position
  private async getCostByPositionAndSize(
    position: string,
    sizeColumn: string,
    printingMethod: string,
  ): Promise<number> {
    const tableName = this.tableMap[position.toLowerCase()];
    if (!tableName) {
      throw new NotFoundException(`Invalid logo position: ${position}`);
    }

    // Query dynamically from the database
    const result = await this.dataSource
      .createQueryBuilder()
      .select(sizeColumn)
      .from(tableName, tableName)
      .where('printing_method = :printingMethod', { printingMethod })
      .getRawOne();

    if (!result || !result[sizeColumn]) {
      throw new NotFoundException(
        `Cost not available for position: ${position}, size: ${sizeColumn}, and method: ${printingMethod}`,
      );
    }

    // Calculate and return mean cost
    return this.calculateMeanCost(result[sizeColumn]);
  }

  // Create Logo Printing Module
  async createLogoPrintingModule(
    projectId: number,
    dto: CreateLogoPrintingDto,
  ): Promise<LogoPrinting> {
    const { logoPosition, printingMethod, logoSize } = dto;

    // Map size to column
    const sizeColumn = this.getSizeColumn(logoSize);
    if (!sizeColumn) {
      throw new NotFoundException(`Invalid logo size: ${logoSize}`);
    }

    // Get the cost dynamically
    const cost = await this.getCostByPositionAndSize(
      logoPosition,
      sizeColumn,
      printingMethod,
    );

    // Create and save the module
    const logoPrinting = this.logoPrintingRepository.create({
      projectId,
      printingMethod,
      size: logoSize,
      logoPosition,
      price: cost,
    });

    return this.logoPrintingRepository.save(logoPrinting);
  }

  // Get total cost of all logo printing modules
  // async getModuleCost(projectId: number): Promise<number> {
  //   const modules = await this.logoPrintingRepository.find({ where: { projectId } });
  //   return modules.reduce((total, module) => total + module.price, 0);
  // }
  async getModuleCost(projectId: number): Promise<number> {
    // Fetch all logo printing modules for the given projectId
    const modules = await this.logoPrintingRepository.find({
      where: { projectId },
      select: ['price'], // Assuming the cost is stored in the 'cost' column
    });
  
    // If no modules are found, return 0 cost
    if (!modules || modules.length === 0) {
      return 0;
    }
  
    // Sum up the cost stored in the database
    return modules.reduce((total, module) => total + Number(module.price), 0);
  }
  
}

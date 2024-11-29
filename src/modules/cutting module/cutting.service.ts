import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Cutting } from './entities/cutting.entity';
import { CreateCuttingDto } from './dto/create-cutting.dto';
import { RegularCutting, SublimationCutting } from '../../entities';

@Injectable()
export class CuttingService {
  constructor(
    @InjectRepository(Cutting)
    private readonly cuttingRepository: Repository<Cutting>,
    @InjectRepository(RegularCutting)
    private readonly regularCuttingRepository: Repository<RegularCutting>,
    @InjectRepository(SublimationCutting)
    private readonly sublimationCuttingRepository: Repository<SublimationCutting>,
  ) {}

  // Method to create a cutting module
  async createCuttingModule(
    createCuttingDto: CreateCuttingDto,
    manager: EntityManager,
  ): Promise<number> {
    const { cuttingStyle, quantity, projectId } = createCuttingDto;

    let ratePerShirt: number;
    let totalCost: number;

    // Fetch data based on the cutting style
    if (cuttingStyle === 'regular') {
      ratePerShirt = await this.getRateFromRange(
        manager,
        'regular_cutting',
        quantity,
      );
    } else if (cuttingStyle === 'sublimation') {
      ratePerShirt = await this.getRateFromRange(
        manager,
        'sublimation_cutting',
        quantity,
      );
    } else {
      throw new NotFoundException('Invalid cutting style');
    }

    // A pattern of single size will cost 600 Rupees
    totalCost = ratePerShirt * quantity + 600;

    // Validate project existence using the transaction manager
    const projectExists = await manager.findOne('Project', {
      where: { id: projectId },
    });
    if (!projectExists) {
      throw new NotFoundException(
        `Project with ID ${projectId} does not exist.`,
      );
    }

    // Prepare the cutting record
    const cutting = manager.create(Cutting, {
      status: 'Active',
      projectId,
      quantity,
      ratePerShirt,
      cost: totalCost,
      cuttingStyle,
    });

    const savedCutting = await manager.save(Cutting, cutting);

    console.log('Saved Cutting Module:', savedCutting);

    // Return the calculated total cost
    return totalCost;
  }

  // Helper method to fetch rate based on the range
  private async getRateFromRange(
    manager: EntityManager,
    tableName: string,
    quantity: number,
  ): Promise<number> {
    // Fetch all rows from the table
    const rates = await manager
      .createQueryBuilder()
      .select(['"quantityOfShirts"', '"ratePerShirt"'])
      .from(tableName, tableName)
      .getRawMany();

    if (!rates || rates.length === 0) {
      console.error('No rates found in the cutting table.');
      throw new NotFoundException('No rates found in the cutting table.');
    }

    // Loop through the rows to find the matching range
    for (const rateRow of rates) {
      const range = rateRow.quantityOfShirts;
      const [min, max] = range
        .split('-')
        .map((value) => parseInt(value.trim()));

      // Handle cases where the range is a single value
      const effectiveMax = max || min;

      // Check if the quantity falls within the range
      if (quantity >= min && quantity <= effectiveMax) {
        return rateRow.ratePerShirt;
      }
    }

    console.error(`No matching range found for quantity: ${quantity}`);
    throw new NotFoundException(
      `No matching rate found for quantity: ${quantity}`,
    );
  }

  // Method to calculate total module cost for a project
  async getModuleCost(projectId: number): Promise<number> {
    const cutting = await this.cuttingRepository.findOne({
      where: { projectId },
    });

    if (!cutting) {
      return 0;
    }

    return cutting.cost;
  }
}

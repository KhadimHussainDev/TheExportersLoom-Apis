import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Cutting } from './entities/cutting.entity';
import { CreateCuttingDto } from './dto/create-cutting.dto';
import { RegularCutting, SublimationCutting } from 'entities';

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
  async createCuttingModule(createCuttingDto: CreateCuttingDto, manager: EntityManager): Promise<Cutting> {
    const { cuttingStyle, quantity, projectId } = createCuttingDto;

    let ratePerShirt: number;
    let totalCost: number;

    console.log('Received Cutting DTO:', createCuttingDto); // Log input data

    // Fetch data based on the cutting style
    if (cuttingStyle === 'regular') {
      ratePerShirt = await this.getRateFromRange(manager, 'regular_cutting', quantity);
    } else if (cuttingStyle === 'sublimation') {
      ratePerShirt = await this.getRateFromRange(manager, 'sublimation_cutting', quantity);
    } else {
      throw new NotFoundException('Invalid cutting style');
    }
    // A pattern of single size will cost 600 Rupees
    totalCost = ratePerShirt * quantity * 600;

    console.log(`Rate per shirt: ${ratePerShirt}, Total cost: ${totalCost}`);

    // Validate project existence using the transaction manager
    const projectExists = await manager.findOne('Project', { where: { id: projectId } });
    if (!projectExists) {
      throw new NotFoundException(`Project with ID ${projectId} does not exist.`);
    }

    // Prepare the cutting record
    const cutting = manager.create(Cutting, {
      status: 'Active', // Assuming status is 'Active' for now
      projectId,
      quantity,
      ratePerShirt,
      cost: totalCost,
      cuttingStyle, // Store the cutting style ("regular" or "sublimation")
    });

    console.log('Cutting data being saved:', cutting); // Log the cutting data being saved

    // Save and return
    return manager.save(Cutting, cutting);
  }

  // Helper method to fetch rate based on the range
  private async getRateFromRange(manager: EntityManager, tableName: string, quantity: number): Promise<number> {
    console.log(`Fetching rate per shirt for quantity: ${quantity} from table: ${tableName}`);

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
      const range = rateRow.quantityOfShirts; // Example: '1-24', '51-99', '25'
      const [min, max] = range.split('-').map((value) => parseInt(value.trim()));

      // Handle cases where the range is a single value (e.g., '25')
      const effectiveMax = max || min;

      // Check if the quantity falls within the range
      if (quantity >= min && quantity <= effectiveMax) {
        console.log(`Matched range: ${range} with ratePerShirt: ${rateRow.ratePerShirt}`);
        return rateRow.ratePerShirt;
      }
    }

    console.error(`No matching range found for quantity: ${quantity}`);
    throw new NotFoundException(`No matching rate found for quantity: ${quantity}`);
  }

  // Method to calculate total module cost for a project
  async getModuleCost(projectId: number): Promise<number> {
    console.log(`Fetching total cost for cutting modules for project ID: ${projectId}`);

    const cuttingModules = await this.cuttingRepository.find({ where: { projectId } });

    if (!cuttingModules || cuttingModules.length === 0) {
      console.warn(`No cutting modules found for project ID: ${projectId}`);
      return 0; // No cutting modules found
    }

    const totalCost = cuttingModules.reduce((sum, module) => sum + Number(module.cost), 0);
    console.log(`Total cutting cost: ${totalCost}`);
    return totalCost;
  }
}

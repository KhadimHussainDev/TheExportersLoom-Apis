import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Cutting } from './entities/cutting.entity';
import { CreateCuttingDto } from './dto/create-cutting.dto';
import { RegularCutting, SublimationCutting } from '../../entities';
import { UpdateCuttingDto } from './dto/update-cutting.dto';
import { BidService } from '../../bid/bid.service';

@Injectable()
export class CuttingService {
  constructor(
    @InjectRepository(Cutting)
    private readonly cuttingRepository: Repository<Cutting>,
    @InjectRepository(RegularCutting)
    private readonly regularCuttingRepository: Repository<RegularCutting>,
    @InjectRepository(SublimationCutting)
    private readonly sublimationCuttingRepository: Repository<SublimationCutting>,
    private readonly bidService: BidService,
  ) { }

  // create a cutting module
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
    // console.log('Saved Cutting Module:', savedCutting);
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


  // edit an existing cutting module by project ID
  async editCuttingModule(
    projectId: number,
    updatedDto: UpdateCuttingDto,
    manager: EntityManager,
  ): Promise<Cutting> {
    const { cuttingStyle, quantity } = updatedDto;

    // Fetch the existing cutting module by project ID
    const existingCuttingModule = await this.cuttingRepository.findOne({
      where: { projectId },
    });

    if (!existingCuttingModule) {
      throw new NotFoundException('Cutting module not found.');
    }

    let ratePerShirt: number;
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

    const totalCost = ratePerShirt * quantity + 600;

    // Update the cutting module with the new data
    existingCuttingModule.quantity = quantity;
    existingCuttingModule.ratePerShirt = ratePerShirt;
    existingCuttingModule.cost = totalCost;
    existingCuttingModule.cuttingStyle = cuttingStyle;
    existingCuttingModule.status = 'Active';

    // Save the updated cutting module
    const updatedCutting = await manager.save(Cutting, existingCuttingModule);
    return updatedCutting;
  }

  async updateCuttingStatus(id: number, newStatus: string) {
    // Retrieve the cutting module and load relations (project, user)
    const cuttingModule = await this.cuttingRepository.findOne({
      where: { id }, // Look up by ID
      relations: ['project', 'project.user'], // Load relations
    });

    // Check if the cutting module was found
    if (!cuttingModule) {
      throw new NotFoundException(`CuttingModule with ID ${id} not found.`);
    }

    // Access the related project and user
    const project = cuttingModule.project;
    const user = project?.user;

    if (!user) {
      throw new NotFoundException(
        `User related to CuttingModule with ID ${id} not found.`,
      );
    }

    const userId = user.user_id; 

    // Create a bid if the status is 'Posted'
    if (newStatus === 'Posted') {
      const title = 'Cutting Module Bid';
      const description = ''; // Add description if needed
      const price = cuttingModule.cost;

      // Create a new bid using the BidService
      await this.bidService.createBid(
        userId,
        cuttingModule.id,
        title,
        description,
        price,
        'Active', 
        'CuttingModule', // Type of the module
      );
    }

    // Update the status of the cutting module
    cuttingModule.status = newStatus;

    // Save the updated cutting module
    await this.cuttingRepository.save(cuttingModule);
  }
}

// src/modules/cutting-quantity-module/cutting.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  // Create a Cutting record and calculate cost based on the cutting style
  async createCuttingModule(createCuttingDto: CreateCuttingDto): Promise<Cutting> {
    const { cuttingStyle, quantity, projectId } = createCuttingDto;

    let ratePerShirt: number;
    let totalCost: number;

    // Fetch data from the appropriate cutting style table
    if (cuttingStyle === 'regular') {
      const regularCutting = await this.regularCuttingRepository.findOne({ where: { quantityOfShirts: String(quantity) } });
      if (!regularCutting) {
        throw new NotFoundException('Regular cutting data not found for the given quantity');
      }

      ratePerShirt = regularCutting.ratePerShirt;
      totalCost = ratePerShirt * quantity;
    } else if (cuttingStyle === 'sublimation') {
      const sublimationCutting = await this.sublimationCuttingRepository.findOne({ where: { quantityOfShirts: String(quantity) } });
      if (!sublimationCutting) {
        throw new NotFoundException('Sublimation cutting data not found for the given quantity');
      }

      ratePerShirt = sublimationCutting.ratePerShirt;
      totalCost = ratePerShirt * quantity;
    } else {
      throw new NotFoundException('Invalid cutting style');
    }

    // Create and save the Cutting record
    const cutting = this.cuttingRepository.create({
      status: 'Active', // Assuming status is 'Active' for now
      projectId,
      quantity,
      ratePerShirt,
      cost: totalCost,
      cuttingStyle, // Store the cutting style ("regular" or "sublimation")
    });

    return await this.cuttingRepository.save(cutting);
  }
  async getModuleCost(projectId: number): Promise<number> {
    // Retrieve all cutting records associated with the given projectId
    const cuttingModules = await this.cuttingRepository.find({
      where: { projectId },
    });

    if (!cuttingModules || cuttingModules.length === 0) {
      throw new NotFoundException(`No cutting modules found for projectId: ${projectId}`);
    }

    // Calculate the total cost by summing up the cost of each module
    const totalCost = cuttingModules.reduce((sum, module) => sum + module.cost, 0);

    return totalCost;
  }
}

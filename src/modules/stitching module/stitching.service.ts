import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stitching } from './entities/stitching.entity';
import { CreateStitchingDto } from './dto/create-stitching.dto';
import { Project } from '../../project/entities/project.entity';

@Injectable()
export class StitchingService {
  constructor(
    @InjectRepository(Stitching) private stitchingRepository: Repository<Stitching>,
    @InjectRepository(Project) private projectRepository: Repository<Project>,
  ) {}

  async createStitching(createStitchingDto: CreateStitchingDto) {
    const stitching = this.stitchingRepository.create(createStitchingDto);
    return await this.stitchingRepository.save(stitching);
  }

  async calculateCost(projectId: number): Promise<Stitching> {
    const project = await this.projectRepository.findOne({ where: { id: projectId } });
    if (!project) {
      throw new Error('Project not found');
    }

    const stitchingRate = await this.getRateFromDb(project.quantity); // Fetch rate based on quantity
    const cost = stitchingRate * project.quantity;

    const stitching = this.stitchingRepository.create({
      status: 'Completed',
      project,
      quantity: project.quantity,
      ratePerShirt: stitchingRate,
      cost,
    });

    return await this.stitchingRepository.save(stitching);
  }

  private async getRateFromDb(quantity: number): Promise<number> {
    // Replace with a query to fetch the rate per shirt from the stitching file (DB)
    const stitchingFile = await this.stitchingRepository
      .createQueryBuilder('stitching')
      .where('stitching.quantityOfShirts <= :quantity', { quantity })
      .orderBy('stitching.quantityOfShirts', 'DESC')
      .getOne();

    if (!stitchingFile) {
      throw new Error('No matching rate found for the provided quantity');
    }

    return stitchingFile.ratePerShirt;
  }
}

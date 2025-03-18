import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid } from '../bid/entities/bid.entity';
import { User } from '../users/entities/user.entity';
import { STATUS } from '../common/constants'; // Assuming STATUS constants are defined

@Injectable()
export class RecommendBidsService {
  constructor(
    @InjectRepository(Bid) private readonly bidRepo: Repository<Bid>,
    @InjectRepository(User) private readonly manufacturerRepo: Repository<User>,
  ) {}

  async getRecommendedBids(manufacturerId: number) {
    const manufacturer = await this.manufacturerRepo.findOne({
      where: { user_id: manufacturerId },
      relations: ['machines'],
    });

    if (!manufacturer) throw new NotFoundException('Manufacturer not found');

    const machineTypes = manufacturer.machines.map(machine => machine.machine_type);

    const relevantBids = await this.bidRepo.createQueryBuilder('bid')
      .where('bid.status = :status', { status: STATUS.ACTIVE })
      .andWhere('bid.machineType IN (:...machineTypes)', { machineTypes })
      .orderBy('bid.createdAt', 'DESC')
      .take(10) // Limiting results to 10 for efficiency
      .getMany();

    return relevantBids;
  }
}

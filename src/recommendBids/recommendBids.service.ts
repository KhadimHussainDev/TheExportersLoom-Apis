import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid } from '../bid/entities/bid.entity';
import { Machine } from '../machines/entities/machine.entity'; // Ensure Machine entity is imported
import { STATUS } from '../common/constants';

@Injectable()
export class RecommendBidsService {
  constructor(
    @InjectRepository(Bid) private readonly bidRepo: Repository<Bid>,
    @InjectRepository(Machine) private readonly machineRepo: Repository<Machine>,
  ) {}

  async getRecommendedBids(manufacturerId: number) {
    // Fetch the machines owned by the manufacturer
    const machines = await this.machineRepo.find({
      where: { machine_owner: { user_id: manufacturerId } }, // Correct relation lookup
      relations: ['machine_owner'],
    });

    if (!machines.length) {
      throw new NotFoundException('No machines found for this manufacturer');
    }

    // Extract machine types from the manufacturer's machines
    const machineTypes = machines.map(machine => machine.machine_type);

    if (!machineTypes.length) {
      throw new NotFoundException('No machine types found for this manufacturer');
    }

    // Fetch relevant bids where the associated machine type matches
    const relevantBids = await this.bidRepo
      .createQueryBuilder('bid')
      .innerJoin('bid.machine', 'machine') // ✅ Join Machine table
      .where('bid.status = :status', { status: STATUS.ACTIVE })
      .andWhere('bid.user_id != :manufacturerId', { manufacturerId }) // Exclude manufacturer's own bids
      .andWhere('machine.machine_type IN (:...machineTypes)', { machineTypes }) // ✅ Correct reference
      .orderBy('bid.createdAt', 'DESC')
      .take(10) // Limit results
      .getMany();

    return relevantBids;
  }
}

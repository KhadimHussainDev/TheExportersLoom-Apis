import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid } from '../bid/entities/bid.entity';
import { Machine } from '../machines/entities/machine.entity';
import { STATUS, MODULE_TO_MACHINE_MAP } from '../common/constants';

@Injectable()
export class RecommendBidsService {
  constructor(
    @InjectRepository(Bid) private readonly bidRepo: Repository<Bid>,
    @InjectRepository(Machine) private readonly machineRepo: Repository<Machine>,
  ) {}

  async getRecommendedBids(manufacturerId: number) {
    //Fetch all machines owned by the manufacturer
    const machines = await this.machineRepo.find({
      where: { machine_owner: { user_id: manufacturerId } },
      relations: ['machine_owner'],
    });

    if (!machines.length) {
      throw new NotFoundException('No machines found for this manufacturer');
    }

    //Extract unique machine types
    const machineTypes = [...new Set(machines.map(machine => machine.machine_type))];

    if (!machineTypes.length) {
      throw new NotFoundException('No machine types registered for this manufacturer');
    }

    //Find all possible `module_type` values that match `machine_type`
    const matchedModuleTypes = Object.entries(MODULE_TO_MACHINE_MAP)
      .filter(([module, machine]) => machineTypes.includes(machine))
      .map(([module]) => module); 

    if (!matchedModuleTypes.length) {
      throw new NotFoundException('No matching module types found for registered machines');
    }

    //Fetch all active bids where `module_type` matches the mapped values
    const recommendedBids = await this.bidRepo
      .createQueryBuilder('bid')
      .where('bid.status = :status', { status: STATUS.ACTIVE })
      .andWhere('bid.user_id != :manufacturerId', { manufacturerId }) // Exclude self-created bids
      .andWhere('bid.module_type IN (:...matchedModuleTypes)', { matchedModuleTypes }) // Match module type
      .orderBy('bid.created_at', 'DESC')
      .getMany();

    return recommendedBids;
  }
}

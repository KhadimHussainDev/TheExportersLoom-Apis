import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid } from '../bid/entities/bid.entity';
import { Machine } from '../machines/entities/machine.entity'; 
import { STATUS } from '../common'; 
import { User } from '../users/entities/user.entity';
import { MODULE_TO_MACHINE_MAP } from '../common/constants'; 

@Injectable()
export class RecommendBidsService {
  constructor(
    @InjectRepository(Bid) private readonly bidRepo: Repository<Bid>,
    @InjectRepository(Machine) private readonly machineRepo: Repository<Machine>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async getRecommendedBids(manufacturerId: number) {
    try {
      // Fetch the machines owned by the manufacturer
      const machines = await this.machineRepo.find({
        where: { machine_owner: { user_id: manufacturerId } }, // Use correct relation name
      });

      if (!machines || machines.length === 0) {
        console.log('No machines found for manufacturer:', manufacturerId);
        return []; // Return empty array instead of throwing an error
      }

      // Extract machine types from the manufacturer's machines
      const machineTypes = machines.map(machine => machine.machine_type);
      console.log('Manufacturer machine types:', machineTypes);

      if (!machineTypes.length) {
        console.log('No machine types found for manufacturer:', manufacturerId);
        return []; // Return empty array instead of throwing an error
      }

      // Create a machine-to-module mapping from MODULE_TO_MACHINE_MAP
      const machineToModuleMap = {};
      
      // Populate the reverse mapping
      Object.entries(MODULE_TO_MACHINE_MAP).forEach(([moduleType, machineType]) => {
        if (!machineToModuleMap[machineType]) {
          machineToModuleMap[machineType] = [];
        }
        machineToModuleMap[machineType].push(moduleType);
      });
      
      console.log('Machine to Module mapping:', machineToModuleMap);
      
      // Get all module types that correspond to the manufacturer's machine types
      const relevantModuleTypes = [];
      
      // For each machine type the manufacturer has, add the corresponding module types
      machineTypes.forEach(machineType => {
        const correspondingModuleTypes = machineToModuleMap[machineType] || [];
        relevantModuleTypes.push(...correspondingModuleTypes);
      });
      
      // Remove duplicates
      const uniqueModuleTypes = [...new Set(relevantModuleTypes)];
      console.log('Relevant module types for query:', uniqueModuleTypes);

      if (uniqueModuleTypes.length === 0) {
        console.log('No relevant module types found for manufacturer:', manufacturerId);
        return [];
      }

      // Fetch relevant bids where the module type matches the manufacturer's machine capabilities
      const relevantBids = await this.bidRepo
        .createQueryBuilder('bid')
        .innerJoinAndSelect('bid.user', 'user') // Join with user for additional info
        .where('bid.status = :status', { status: STATUS.ACTIVE })
        .andWhere('bid.module_type IN (:...moduleTypes)', { moduleTypes: uniqueModuleTypes })
        .andWhere('user.user_id != :manufacturerId', { manufacturerId }) // Exclude manufacturer's own bids
        .orderBy('bid.created_at', 'DESC')
        .take(10) // Limit results
        .getMany();

      console.log(`Found ${relevantBids.length} relevant bids for manufacturer ${manufacturerId}`);
      return relevantBids;
    } catch (error) {
      console.error('Error getting recommended bids:', error);
      return []; // Return empty array on error
    }
  }
}

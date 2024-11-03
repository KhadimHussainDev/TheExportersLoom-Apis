// src/machines/machine.service.ts
import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Machine } from './entities/machine.entity';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class MachineService {
    constructor(
        @InjectRepository(Machine)
        private machineRepository: Repository<Machine>,
    ) {}

    async registerMachine(user: User, createMachineDto: CreateMachineDto): Promise<Machine> {
        // here role is geting checked but for now as if user do signuo from google then role is not specfied so for this 
        // dont work 
        // if (!user || user.userType !== 'manufacturer') {
        //     console.error('Unauthorized access: User type is not manufacturer'); // Debugging output
        //     throw new UnauthorizedException('Only manufacturers can register machines.');
        // }
        const machine = this.machineRepository.create({
          ...createMachineDto,
          machine_owner: user,
        });
        return this.machineRepository.save(machine);
    }
      
  
    // Get all machines
    async findAll(): Promise<Machine[]> {
        return this.machineRepository.find({ relations: ['machine_owner'] });
    }

    // Get a machine by ID
    async findOne(id: number): Promise<Machine> {
        const machine = await this.machineRepository.findOne({ where: { machine_id: id }, relations: ['machine_owner'] });
        if (!machine) {
            throw new NotFoundException(`Machine with ID ${id} not found.`);
        }
        return machine;
    }

    // Update a machine's details
    async updateMachine(id: number, updateMachineDto: UpdateMachineDto, user: User): Promise<Machine> {  
            const machine = await this.machineRepository.findOne({ where: { machine_id: id } });
            if (!machine) {
                throw new NotFoundException(`Machine with ID ${id} not found.`);
            }
            // if (machine.machine_owner.user_id !== user.user_id) {
            //     console.error(`Unauthorized access: User ${user.user_id} does not own machine ${id}`);
            //     throw new UnauthorizedException('You do not own this machine.');
            // }
        Object.assign(machine, updateMachineDto);
        return this.machineRepository.save(machine);
    }
    

    // Delete a machine
    async deleteMachine(id: number, user: User): Promise<void> {
        const machine = await this.findOne(id);
        if (!machine) {
            throw new NotFoundException(`Machine with ID ${id} not found.`);
        }
        machine.availability_status = false;
        await this.machineRepository.save(machine);
    }
}

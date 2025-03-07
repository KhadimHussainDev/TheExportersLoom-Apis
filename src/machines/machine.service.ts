// src/machines/machine.service.ts
import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
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
    if (user.userType !== 'manufacturer') {
      throw new UnauthorizedException('Only manufacturers can register machines.');
    }
  
    const { machine_type, machine_model } = createMachineDto;
  
    // Check if the manufacturer has already registered this machine type and model
    const existingMachine = await this.machineRepository.findOne({
      where: {
        machine_type,
        machine_model,
        machine_owner: user,
      },
    });
  
    if (existingMachine) {
      throw new UnauthorizedException('You have already registered this machine.');
    }
  
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
    const machine = await this.machineRepository.findOne({
      where: { machine_id: id },
      relations: ['machine_owner'],
    });
    if (!machine) {
      throw new NotFoundException(`Machine with ID ${id} not found.`);
    }
    return machine;
  }

  // Update a machine's details
  async updateMachine(
    id: number,
    updateMachineDto: UpdateMachineDto,
    user: User,
  ): Promise<Machine> {
    console.log('User object:', user); // Debugging line
  
    if (!user) {
      throw new UnauthorizedException('User is not authenticated.');
    }
  
    if (!user.userType) {
      throw new UnauthorizedException('User type is missing.');
    }
  
    if (user.userType !== 'manufacturer') {
      throw new UnauthorizedException('Only manufacturers can update machines.');
    }
  
    const machine = await this.machineRepository.findOne({
      where: { machine_id: id },
      relations: ['machine_owner'],
    });
  
    if (!machine) {
      throw new NotFoundException(`Machine with ID ${id} not found.`);
    }
  
    if (machine.machine_owner.user_id !== user.user_id) {
      throw new UnauthorizedException('You can only update your own machines.');
    }
  
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

// src/machines/machine.service.ts
import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Machine } from './entities/machine.entity';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { User } from '../users/entities/user.entity';
import { ROLES } from '../common';

@Injectable()
export class MachineService {
  constructor(
    @InjectRepository(Machine)
    private machineRepository: Repository<Machine>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async registerMachine(user: User, createMachineDto: CreateMachineDto): Promise<Machine> {
    console.log('User received in service:', user);
    if (user.userType !== ROLES.MANUFACTURER) {
      throw new UnauthorizedException('Only manufacturers can register machines.');
    }
  
    const { machine_type, machine_model, location, availability_status, hourly_rate, description, machine_image } = createMachineDto;
  
    // Validate required fields
    if (!machine_type || !machine_model || !location || !hourly_rate || !description || !machine_image) {
      throw new BadRequestException('All machine fields are required.');
    }
  
    // Fetch the user entity from the database
    const userEntity = user;
  
    if (!userEntity) {
      throw new NotFoundException('User not found.');
    }
  
    // Check for existing machine
    const existingMachine = await this.machineRepository.findOne({
      where: { machine_type, machine_model, machine_owner: { user_id: user.user_id } },
    });
  
    if (existingMachine) {
      throw new UnauthorizedException('You have already registered this machine.');
    }
  
    // Create the machine entity
    const machine = this.machineRepository.create({
      machine_type,
      machine_model,
      location,
      availability_status,
      hourly_rate,
      description,
      machine_image,
      machine_owner: userEntity, // Assign the valid user entity
    });
  
    try {
      const result = await this.machineRepository.save(machine);
      return result; // Return the saved machine
    } catch (error) {
      console.error('Error while saving machine:', error);
      throw new InternalServerErrorException('Failed to register machine. Please try again.');
    }
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
  
    if (!user) {
      throw new UnauthorizedException('User is not authenticated.');
    }
  
    if (!user.userType) {
      throw new UnauthorizedException('User type is missing.');
    }
  
    if (user.userType !== ROLES.MANUFACTURER) {
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

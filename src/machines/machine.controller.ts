// src/machines/machine.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req, ParseIntPipe, UnauthorizedException } from '@nestjs/common';
import { MachineService } from './machine.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../users/entities/user.entity';

@Controller('machines')
export class MachineController {
    constructor(private readonly machineService: MachineService) { }

    @Post('register')
    @UseGuards(AuthGuard('jwt'))
    async registerMachine(@Req() req, @Body() createMachineDto: CreateMachineDto) {
        if (!req.user || !req.user.userType) {
            throw new UnauthorizedException('User type is missing');
        }
        return this.machineService.registerMachine(req.user, createMachineDto);
    }

    // Get all machines
    @Get()
    async findAll() {
        return this.machineService.findAll();
    }

    // Get a specific machine by ID
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.machineService.findOne(id);
    }

    // Update a specific machine
    @Put(':id')
    async updateMachine(
        @Param('id') id: number,
        @Body() updateMachineDto: UpdateMachineDto,
        @Req() req
    ) {
        return this.machineService.updateMachine(id, updateMachineDto, req.user);
    }

    // Delete a specific machine
    @Delete(':id')
    async deleteMachine(@Req() req, @Param('id', ParseIntPipe) id: number) {
        const user: User = req.user;
        await this.machineService.deleteMachine(id, user);
        return { message: `Machine with ID ${id} has been deleted successfully.` };
    }
}

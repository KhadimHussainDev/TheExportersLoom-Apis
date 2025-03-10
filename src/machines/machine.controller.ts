// src/machines/machine.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { User } from '../users/entities/user.entity';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { MachineService } from './machine.service';

@Controller('machines')
export class MachineController {
  constructor(private readonly machineService: MachineService) { }

  @Post('register')
  @UseGuards(AuthGuard('jwt'))
  async registerMachine(
    @Req() req,
    @Body() createMachineDto: CreateMachineDto,
  ): Promise<ApiResponseDto<any>> {
    const user = req.user as User;
    const machine = await this.machineService.registerMachine(user, createMachineDto);
    return ApiResponseDto.success(
      HttpStatus.CREATED,
      'Machine registered successfully',
      machine
    );
  }

  @Get()
  async findAll(): Promise<ApiResponseDto<any>> {
    const machines = await this.machineService.findAll();
    return ApiResponseDto.success(
      HttpStatus.OK,
      'Machines retrieved successfully',
      machines
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ApiResponseDto<any>> {
    const machine = await this.machineService.findOne(id);
    return ApiResponseDto.success(
      HttpStatus.OK,
      'Machine retrieved successfully',
      machine
    );
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async updateMachine(
    @Param('id') id: number,
    @Body() updateMachineDto: UpdateMachineDto,
    @Req() req,
  ): Promise<ApiResponseDto<any>> {
    const user = req.user as User;
    const updatedMachine = await this.machineService.updateMachine(id, updateMachineDto, user);
    return ApiResponseDto.success(
      HttpStatus.OK,
      'Machine updated successfully',
      updatedMachine
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteMachine(
    @Req() req,
    @Param('id', ParseIntPipe) id: number
  ): Promise<ApiResponseDto<any>> {
    const user = req.user as User;
    const result = await this.machineService.deleteMachine(id, user);
    return ApiResponseDto.success(
      HttpStatus.OK,
      'Machine deleted successfully',
      result
    );
  }
}

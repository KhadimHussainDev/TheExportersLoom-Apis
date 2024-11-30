import { Controller, Post, Body, Param, Put } from '@nestjs/common';
import { StitchingService } from './stitching.service';
import { CreateStitchingDto } from './dto/create-stitching.dto';
import { DataSource } from 'typeorm';
import { UpdateStitchingDto } from './dto/update-stitchign.dto';

@Controller('stitching')
export class StitchingController {
  constructor(
    private readonly stitchingService: StitchingService,
    private readonly dataSource: DataSource,
  ) {}

  @Post()
  async createStitching(@Body() createStitchingDto: CreateStitchingDto) {
    return await this.dataSource.transaction(async (manager) => {
      console.log('Creating Stitching with transaction...');
      return this.stitchingService.createStitching(manager, createStitchingDto);
    });
  }


  // Edit an existing stitching module by project ID
  @Put(':projectId')
  async editStitching(
    @Param('projectId') projectId: number,
    @Body() updatedDto: UpdateStitchingDto,  // Use Update DTO here
  ) {
    return await this.dataSource.transaction(async (manager) => {
      console.log('Editing Stitching with transaction...');
      return this.stitchingService.editStitchingModule(
        projectId,
        updatedDto,
        manager,
      );
    });
  }
}
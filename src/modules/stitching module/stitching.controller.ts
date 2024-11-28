import { Controller, Post, Body, Param } from '@nestjs/common';
import { StitchingService } from './stitching.service';
import { CreateStitchingDto } from './dto/create-stitching.dto';
import { DataSource } from 'typeorm';

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
}
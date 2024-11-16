import { Controller, Post, Body, Param } from '@nestjs/common';
import { StitchingService } from './stitching.service';
import { CreateStitchingDto } from './dto/create-stitching.dto';

@Controller('stitching')
export class StitchingController {
  constructor(private readonly stitchingService: StitchingService) {}

  @Post()
  async createStitching(@Body() createStitchingDto: CreateStitchingDto) {
    return this.stitchingService.createStitching(createStitchingDto);
  }

  @Post(':projectId/calculate')
  async calculateCost(@Param('projectId') projectId: number) {
    return this.stitchingService.calculateCost(projectId);
  }
}

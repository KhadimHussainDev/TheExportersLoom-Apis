import {
  Controller,
  Post,
  Body,
  Param,
  Put,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { StitchingService } from './stitching.service';
import { CreateStitchingDto } from './dto/create-stitching.dto';
import { DataSource } from 'typeorm';
import { UpdateStitchingDto } from './dto/update-stitchign.dto';
import { JwtStrategy } from '../../auth/jwt.strategy';

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
    @Body() updatedDto: UpdateStitchingDto, // Use Update DTO here
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
  @UseGuards(JwtStrategy)
  @Put('/:id/status')
  async updatestitchingStatus(
    @Param('id') id: number, // The ID of the FabricPricingModule to update
    @Body('newStatus') newStatus: string, // The new status to update to
  ) {
    try {
      const upadteStitchingModule =
        await this.stitchingService.updateStitchingStatus(id, newStatus);

      return upadteStitchingModule; // Return updated fabric pricing module with success message
    } catch (error) {
      throw new NotFoundException(
        `Error updating stitching module: ${error.message}`,
      );
    }
  }
}

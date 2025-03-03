import { Controller, Post, Body, NotFoundException, Put, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { LogoPrintingService } from './logo-printing.service';
import { CreateLogoPrintingDto } from './dto/create-logo-printing.dto';
import { LogoPrinting } from './entities/logo-printing.entity';
import { UpdateLogoPrintingDto } from './dto/update-logo-printing.dto';
import { JwtStrategy } from '../../auth/jwt.strategy';

@Controller('logo-printing')
export class LogoPrintingController {
  constructor(
    private readonly logoPrintingService: LogoPrintingService,
    private readonly dataSource: DataSource,
  ) { }

  // @Post('calculate-price')
  // async calculateMeanCost(@Body() dto: CreateLogoPrintingDto): Promise<number> {
  //   const { logoPosition, printingMethod, logoSize } = dto;
  //   const sizeColumn = this.logoPrintingService.getSizeColumn(logoSize);
  //   if (!sizeColumn) {
  //     throw new NotFoundException(`Invalid logo size: ${logoSize}`);
  //   }

  //   const manager = this.dataSource.createEntityManager();
  //   return this.logoPrintingService.getCostByPositionAndSize(
  //     manager,
  //     logoPosition,
  //     sizeColumn,
  //     printingMethod,
  //   );
  // }

  @Post('calculate-price')
  async calculateMeanCost(@Body() dto: CreateLogoPrintingDto): Promise<{ meanCost: number }> {
    if (!dto.logoDetails || dto.logoDetails.length === 0) {
      throw new BadRequestException('logoDetails array is required and cannot be empty.');
    }
    if (!dto.sizes || dto.sizes.length === 0) {
      throw new BadRequestException('sizes array is required and cannot be empty.');
    }
  
    const manager = this.dataSource.createEntityManager();
    let totalCost = 0;
  
    for (const sizeData of dto.sizes) {
      const { size: requiredSize } = sizeData;
  
      for (const logo of dto.logoDetails) {
        const { logoPosition, printingMethod } = logo;
  
        // ✅ Now it's public, so it can be accessed
        const sizeColumn = await this.logoPrintingService.getSizeColumn(manager, logoPosition, requiredSize);
        if (!sizeColumn) {
          throw new NotFoundException(`Invalid size mapping for ${requiredSize} at position ${logoPosition}`);
        }
  
        // ✅ Now it's public, so it can be accessed
        const costRange = await this.logoPrintingService.getCostByPositionAndSize(manager, logoPosition, sizeColumn, printingMethod);
  
        // ✅ Directly use costRange since it's already a number
        totalCost += costRange;
      }
    }
  
    return { meanCost: totalCost };
  }
  


  @Post('create')
  async createLogoPrintingModule(@Body() dto: CreateLogoPrintingDto) {
    if (!dto.projectId) {
      throw new BadRequestException('projectId is required.');
    }
    if (!dto.logoDetails || dto.logoDetails.length === 0) {
      throw new BadRequestException('logoDetails array is required and cannot be empty.');
    }
    if (!dto.sizes || dto.sizes.length === 0) {
      throw new BadRequestException('sizes array is required and cannot be empty.');
    }

    const manager = this.dataSource.createEntityManager(); // ✅ Create EntityManager
    return this.logoPrintingService.createLogoPrintingModule(dto.projectId, dto, manager);
  }


  // @Put('edit/:projectId')
  // async editLogoPrintingModule(
  //   @Param('projectId') projectId: number,
  //   @Body() dto: UpdateLogoPrintingDto,
  // ): Promise<LogoPrinting> {
  //   const manager = this.dataSource.createEntityManager();
  //   return this.logoPrintingService.editLogoPrintingModule(
  //     projectId,
  //     dto,
  //     manager,
  //   );
  // }

  @UseGuards(JwtStrategy)
  @Put('/:id/status')
  async updateLogoPritingStatus(
    @Param('id') id: number,  // The ID of the FabricPricingModule to update
    @Body('newStatus') newStatus: string,  // The new status to update to
  ) {
    try {
      const updatedlogoModule = await this.logoPrintingService.updateLogoPrintingStatus(
        id,
        newStatus,
      );

      return updatedlogoModule;  // Return updated fabric pricing module with success message
    } catch (error) {
      throw new NotFoundException(
        `Error updating logo module: ${error.message}`,
      );
    }
  }
}
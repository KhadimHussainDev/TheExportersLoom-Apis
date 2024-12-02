import { Controller, Post, Body, NotFoundException, Put, Param,UseGuards } from '@nestjs/common';
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

  @Post('calculate-price')
  async calculateMeanCost(@Body() dto: CreateLogoPrintingDto): Promise<number> {
    const { logoPosition, printingMethod, logoSize } = dto;
    const sizeColumn = this.logoPrintingService.getSizeColumn(logoSize);
    if (!sizeColumn) {
      throw new NotFoundException(`Invalid logo size: ${logoSize}`);
    }

    const manager = this.dataSource.createEntityManager();
    return this.logoPrintingService.getCostByPositionAndSize(
      manager,
      logoPosition,
      sizeColumn,
      printingMethod,
    );
  }

  @Post('create')
  async createLogoPrintingModule(@Body() dto: CreateLogoPrintingDto) {
    const manager = this.dataSource.createEntityManager();
    return this.logoPrintingService.createLogoPrintingModule(
      dto.projectId,
      dto,
      manager,
    );
  }


  @Put('edit/:projectId')
  async editLogoPrintingModule(
    @Param('projectId') projectId: number,
    @Body() dto: UpdateLogoPrintingDto,
  ): Promise<LogoPrinting> {
    const manager = this.dataSource.createEntityManager();
    return this.logoPrintingService.editLogoPrintingModule(
      projectId,
      dto,
      manager,
    );
  }

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
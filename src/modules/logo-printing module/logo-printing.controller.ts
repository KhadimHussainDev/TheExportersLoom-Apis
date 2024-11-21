// src/modules/logo-printing-module/logo-printing.controller.ts
import { Controller, Post, Body,NotFoundException } from '@nestjs/common';
import { LogoPrintingService } from './logo-printing.service';
import { CreateLogoPrintingDto } from './dto/create-logo-printing.dto';

@Controller('logo-printing')
export class LogoPrintingController {
  constructor(private readonly logoPrintingService: LogoPrintingService) {}

  // Endpoint to calculate logo price based on position
  @Post('calculate-price')
  async calculateMeanCost(@Body() dto: CreateLogoPrintingDto): Promise<number> {
    const { logoPosition, printingMethod, logoSize } = dto;

    // Map size to column
    const sizeColumn = this.logoPrintingService['getSizeColumn'](logoSize);
    if (!sizeColumn) {
      throw new NotFoundException(`Invalid logo size: ${logoSize}`);
    }

    return this.logoPrintingService['getCostByPositionAndSize'](logoPosition, sizeColumn, printingMethod);
  }

  // Optional: Endpoint to create logo pricing data (if needed for DB storage)
  @Post('create')
  async createLogoPrintingModule(@Body() dto: CreateLogoPrintingDto) {
    return this.logoPrintingService.createLogoPrintingModule(dto.projectId, dto);
  }
}

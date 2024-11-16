// src/modules/logo-printing-module/logo-printing.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { LogoPrintingService } from './logo-printing.service';
import { CreateLogoPrintingDto } from './dto/create-logo-printing.dto';

@Controller('logo-printing')
export class LogoPrintingController {
  constructor(private readonly logoPrintingService: LogoPrintingService) {}

  // Endpoint to calculate logo price based on position
  @Post('calculate-price')
  async calculatePrice(@Body() dto: CreateLogoPrintingDto): Promise<number> {
    return this.logoPrintingService.calculatePrice(dto);
  }

  // Optional: Endpoint to create logo pricing data (if needed for DB storage)
  @Post('create')
  async createLogoPricing(@Body() dto: CreateLogoPrintingDto) {
    return this.logoPrintingService.createLogoPricing(dto);
  }
}

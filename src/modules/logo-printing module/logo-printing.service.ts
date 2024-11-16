// src/modules/logo-printing-module/logo-printing.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogoPrinting } from './entities/logo-printing.entity';
import { CreateLogoPrintingDto } from './dto/create-logo-printing.dto';

@Injectable()
export class LogoPrintingService {
  constructor(
    @InjectRepository(LogoPrinting)
    private readonly logoPrintingRepository: Repository<LogoPrinting>,
  ) {}

  // Handle the logic to calculate logo pricing based on position
  async calculatePrice(dto: CreateLogoPrintingDto): Promise<number> {
    const { logoPosition, printingMethod, logoSize } = dto;

    // Find the logo position in the database
    const logoPositionData = await this.logoPrintingRepository.findOne({
      where: { logoPosition, printingMethod, size: logoSize },
    });

    if (!logoPositionData) {
      throw new NotFoundException('Logo position data not found');
    }

    // Return the calculated price based on the logo data
    return logoPositionData.price;
  }

  // Create a new logo pricing entry (optional, for storing in DB)
  async createLogoPricing(dto: CreateLogoPrintingDto): Promise<LogoPrinting> {
    const newLogoPricing = this.logoPrintingRepository.create(dto);
    return this.logoPrintingRepository.save(newLogoPricing);
  }
}

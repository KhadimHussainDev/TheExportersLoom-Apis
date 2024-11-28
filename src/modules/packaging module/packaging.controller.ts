import { Controller, Post, Body, NotFoundException } from '@nestjs/common';
import { PackagingService } from './packaging.service';
import { CreatePackagingDto } from './dto/create-packaging.dto';
import { DataSource } from 'typeorm';

@Controller('packaging')
export class PackagingController {
  constructor(
    private readonly packagingService: PackagingService,
    private readonly dataSource: DataSource,
  ) {}

  @Post('create')
  async createPackagingModule(@Body() dto: CreatePackagingDto) {
    const manager = this.dataSource.createEntityManager();

    try {
      const packaging = await this.packagingService.createPackagingModule(
        dto,
        manager,
      );
      return { message: 'Packaging module created successfully', packaging };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}

// packaging.controller.ts
import { Controller, Post, Body, Param } from '@nestjs/common';
import { PackagingService } from './packaging.service';
import { CreatePackagingDto } from './dto/create-packaging.dto';

@Controller('packaging')
export class PackagingController {
  constructor(private readonly packagingService: PackagingService) {}

  @Post(':projectId')
  async createPackaging(@Param('projectId') projectId: number, @Body() createPackagingDto: CreatePackagingDto) {
    const { quantity } = createPackagingDto;
    return await this.packagingService.createPackagingModule(projectId, quantity);
  }
}

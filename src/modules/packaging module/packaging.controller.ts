import { Controller, Post, Body, NotFoundException, Put, Param } from '@nestjs/common';
import { PackagingService } from './packaging.service';
import { CreatePackagingDto } from './dto/create-packaging.dto';
import { DataSource } from 'typeorm';
import { UpdatePackagingDto } from './dto/update-packaging.dto';

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

 // Edit Packaging module with transaction support
 @Put(':projectId')
 async editPackagingModule(
   @Param('projectId') projectId: number,
   @Body() updatedDto: UpdatePackagingDto,  // Use Update DTO here
 ) {
   const manager = this.dataSource.createEntityManager();

   try {
     // Begin transaction to update packaging module
     const updatedPackaging = await this.packagingService.editPackagingModule(
       projectId,
       updatedDto,
       manager,
     );
     return {
       message: 'Packaging module updated successfully',
       updatedPackaging,
     };
   } catch (error) {
     // Handle error appropriately
     throw new NotFoundException(error.message);
   }
 }
}

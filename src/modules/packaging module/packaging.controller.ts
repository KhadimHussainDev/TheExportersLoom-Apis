import {
  Controller,
  Post,
  Body,
  NotFoundException,
  Put,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PackagingService } from './packaging.service';
import { CreatePackagingDto } from './dto/create-packaging.dto';
import { DataSource } from 'typeorm';
import { UpdatePackagingDto } from './dto/update-packaging.dto';
import { JwtStrategy } from '../../auth/jwt.strategy';

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

 // Edit Packaging module
 @Put(':projectId')
 async editPackagingModule(
   @Param('projectId') projectId: number,
   @Body() updatedDto: UpdatePackagingDto, 
 ) {
   const manager = this.dataSource.createEntityManager();

   try {
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
     throw new NotFoundException(error.message);
   }
 }

 @UseGuards(JwtStrategy)
  @Put('/:id/status')
  async updatepackagingStatus(
    @Param('id') id: number,  
    @Body('newStatus') newStatus: string,  
  ) {
    try {
      const updatedpackagingModule = await this.packagingService.updatePackagingBagsStatus(
        id,
        newStatus,
      );

      return updatedpackagingModule;  
    } catch (error) {
      throw new NotFoundException(
        `Error updating packaging module: ${error.message}`,
      );
    }
  }
}

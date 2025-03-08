import { BadRequestException, Body, Controller, HttpStatus, NotFoundException, Param, Post, Put, UseGuards } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { JwtStrategy } from '../../auth/jwt.strategy';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { CreateLogoPrintingDto } from './dto/create-logo-printing.dto';
import { UpdateLogoPrintingDto } from './dto/update-logo-printing.dto';
import { LogoPrinting } from './entities/logo-printing.entity';
import { LogoPrintingService } from './logo-printing.service';

@Controller('logo-printing')
export class LogoPrintingController {
  constructor(
    private readonly logoPrintingService: LogoPrintingService,
    private readonly dataSource: DataSource,
  ) { }

  @Post('calculate-price')
  async calculateMeanCost(@Body() dto: CreateLogoPrintingDto): Promise<ApiResponseDto<{ meanCost: number }>> {
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
        const sizeColumn = await this.logoPrintingService.getSizeColumn(manager, logoPosition, requiredSize);
        if (!sizeColumn) {
          throw new NotFoundException(`Invalid size mapping for ${requiredSize} at position ${logoPosition}`);
        }
        const costRange = await this.logoPrintingService.getCostByPositionAndSize(manager, logoPosition, sizeColumn, printingMethod);
        totalCost += costRange;
      }
    }

    return ApiResponseDto.success(
      HttpStatus.OK,
      'Mean cost calculated successfully',
      { meanCost: totalCost }
    );
  }

  @Post()
  async createLogoPrintingModule(@Body() dto: CreateLogoPrintingDto): Promise<ApiResponseDto<number>> {
    if (!dto.projectId) {
      throw new BadRequestException('projectId is required.');
    }
    if (!dto.logoDetails || dto.logoDetails.length === 0) {
      throw new BadRequestException('logoDetails array is required and cannot be empty.');
    }
    if (!dto.sizes || dto.sizes.length === 0) {
      throw new BadRequestException('sizes array is required and cannot be empty.');
    }

    const manager = this.dataSource.createEntityManager();
    const logoPrinting = await this.logoPrintingService.createLogoPrintingModule(dto.projectId, dto, manager);

    return ApiResponseDto.success(
      HttpStatus.CREATED,
      'Logo printing module created successfully',
      logoPrinting
    );
  }

  @Put('edit/:projectId')
  async editLogoPrintingModule(
    @Param('projectId') projectId: number,
    @Body() dto: UpdateLogoPrintingDto,
  ): Promise<ApiResponseDto<LogoPrinting>> {
    const manager = this.dataSource.createEntityManager();
    const updatedLogoPrinting = await this.logoPrintingService.editLogoPrintingModule(
      projectId,
      dto,
      manager
    );

    return ApiResponseDto.success(
      HttpStatus.OK,
      'Logo printing module updated successfully',
      updatedLogoPrinting
    );
  }

  @UseGuards(JwtStrategy)
  @Put('/:id/status')
  async updateLogoPritingStatus(
    @Param('id') id: number,
    @Body('newStatus') newStatus: string,
  ): Promise<ApiResponseDto<any>> {
    try {
      const result = await this.logoPrintingService.updateLogoPrintingStatus(
        id,
        newStatus,
      );

      return ApiResponseDto.success(
        HttpStatus.OK,
        'Logo printing status updated successfully',
        result
      );
    } catch (error) {
      throw new NotFoundException(
        `Error updating logo module: ${error.message}`,
      );
    }
  }
}
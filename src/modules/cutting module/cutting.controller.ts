import { Body, Controller, HttpStatus, Param, Put, UseGuards } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { JwtStrategy } from '../../auth/jwt.strategy';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { CuttingService } from './cutting.service';
import { UpdateCuttingDto } from './dto/update-cutting.dto';
import { Cutting } from './entities/cutting.entity';

@Controller('cutting')
export class CuttingController {
  constructor(
    private readonly cuttingService: CuttingService,
    private readonly dataSource: DataSource,
  ) { }

  @Put('edit/:projectId')
  async editCuttingModule(
    @Param('projectId') projectId: number,
    @Body() updateCuttingDto: UpdateCuttingDto,
  ): Promise<ApiResponseDto<Cutting>> {
    const manager = this.dataSource.createEntityManager();
    const cutting = await this.cuttingService.editCuttingModule(projectId, updateCuttingDto, manager);
    return ApiResponseDto.success(
      HttpStatus.OK,
      'Cutting module updated successfully',
      cutting
    );
  }

  @UseGuards(JwtStrategy)
  @Put('/:id/status')
  async updateCuttingStatus(
    @Param('id') id: number,
    @Body('newStatus') newStatus: string,
  ): Promise<ApiResponseDto<any>> {
    const result = await this.cuttingService.updateCuttingStatus(id, newStatus);
    return ApiResponseDto.success(
      HttpStatus.OK,
      'Cutting status updated successfully',
      result
    );
  }
}

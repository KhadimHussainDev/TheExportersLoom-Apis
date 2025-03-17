import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegularCutting, SublimationCutting } from '../../entities';
import { CuttingController } from './cutting.controller';
import { CuttingService } from './cutting.service';
import { Cutting } from './entities/cutting.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cutting, RegularCutting, SublimationCutting]),
  ],
  controllers: [CuttingController],
  providers: [CuttingService],
  exports: [CuttingService],
})
export class CuttingModule { }

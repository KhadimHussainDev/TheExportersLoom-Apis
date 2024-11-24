// src/modules/cutting-quantity-module/cutting.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CuttingService } from './cutting.service';
import { Cutting } from './entities/cutting.entity';
import { RegularCutting } from 'entities/regular-cutting.entity';
import { SublimationCutting } from 'entities/sublimation-cutting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cutting, RegularCutting, SublimationCutting])],
  providers: [CuttingService],
  exports: [CuttingService],
})
export class CuttingModule {}

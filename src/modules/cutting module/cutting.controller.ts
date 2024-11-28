import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CuttingService } from './cutting.service';
import { Cutting } from './entities/cutting.entity';
import { RegularCutting, SublimationCutting } from 'entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cutting, RegularCutting, SublimationCutting]),
  ],
  providers: [CuttingService],
})
export class CuttingModule {}

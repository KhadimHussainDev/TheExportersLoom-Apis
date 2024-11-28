import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stitching } from './entities/stitching.entity';
import { StitchingController } from './stitching.controller';
import { StitchingService } from './stitching.service';
import { Project } from '../../project/entities/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Stitching, Project])],
  controllers: [StitchingController],
  providers: [StitchingService],
  exports: [StitchingService],
})
export class StitchingModule {}
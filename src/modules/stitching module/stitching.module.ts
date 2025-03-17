import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../../project/entities/project.entity';
import { Stitching } from './entities/stitching.entity';
import { StitchingController } from './stitching.controller';
import { StitchingService } from './stitching.service';
import { UsersModule } from 'users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Stitching, Project]), forwardRef(() => UsersModule),],
  controllers: [StitchingController],
  providers: [StitchingService],
  exports: [StitchingService],
})
export class StitchingModule { }
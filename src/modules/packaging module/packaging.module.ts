import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackagingService } from './packaging.service';
import { PackagingController } from './packaging.controller';
import { PackagingBags } from '../../entities/packaging-bags.entity';
import { Packaging } from '../packaging module/entities/packaging.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Packaging, PackagingBags])],
  controllers: [PackagingController],
  providers: [PackagingService],
  exports: [PackagingService],
})
export class PackagingModule {}

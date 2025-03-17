import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackagingBags } from '../../entities/packaging-bags.entity';
import { Packaging } from './entities/packaging.entity';
import { PackagingController } from './packaging.controller';
import { PackagingService } from './packaging.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Packaging, PackagingBags]),
  ],
  controllers: [PackagingController],
  providers: [PackagingService],
  exports: [PackagingService],
})
export class PackagingModule { }

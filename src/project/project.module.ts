import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { Project } from './entities/project.entity';
import { FabricQuantityModule } from '../modules/fabric-quantity-module/fabric-quantity.module';
import { FabricPricingModule } from '../modules/fabric-price module/fabric-pricing.module';
import { LogoPrintingModule } from '../modules/logo-printing module/logo-printing.module';
import { CuttingModule } from '../modules/cutting module/cutting.module';
import { StitchingModule } from '../modules/stitching module/stitching.module';
import { PackagingModule } from '../modules/packaging module/packaging.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project]),
    FabricQuantityModule,
    forwardRef(() => CuttingModule),
    forwardRef(() => StitchingModule),
    PackagingModule,
    forwardRef(() => FabricPricingModule),
    forwardRef(() => LogoPrintingModule),
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}

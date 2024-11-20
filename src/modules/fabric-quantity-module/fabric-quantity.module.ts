// src/modules/fabric-quantity-module/fabric-quantity.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FabricQuantityController } from './fabric-quantity.controller';
import { FabricQuantityService } from './fabric-quantity.service';
import { FabricQuantity } from './entities/fabric-quantity.entity';
import { FabricSizeCalculation } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([FabricQuantity, FabricSizeCalculation])],
  controllers: [FabricQuantityController],
  providers: [FabricQuantityService],
})
export class FabricQuantityModule {}

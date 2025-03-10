import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BottomHem } from '../entities/bottom-hem.entity';
import { FabricPricing } from '../entities/fabric-pricing.entity';
import { LogoSizes } from '../entities/logo-sizes.entity';
import { ShirtTypes } from '../entities/shirt-type.entity';
import { ProductConfigurationController } from './product-configuration.controller';
import { ProductConfigurationService } from './product-configuration.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LogoSizes,
      BottomHem,
      FabricPricing,
      ShirtTypes,
    ]),
  ],
  controllers: [ProductConfigurationController],
  providers: [ProductConfigurationService],
  exports: [ProductConfigurationService],
})
export class ProductConfigurationModule { } 
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CuttingModule } from '../modules/cutting module/cutting.module';
import { FabricPricingModule as FabricPricingModuleEntity } from '../modules/fabric-price module/entities/fabric-pricing-module.entity';
import { FabricPricingModule } from '../modules/fabric-price module/fabric-pricing.module';
import { FabricQuantityModule } from '../modules/fabric-quantity-module/fabric-quantity.module';
import { LogoPrintingModule } from '../modules/logo-printing module/logo-printing.module';
import { PackagingModule } from '../modules/packaging module/packaging.module';
import { StitchingModule } from '../modules/stitching module/stitching.module';
import { OrderModule } from '../order/order.module';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { BidController } from './bid.controller';
import { BidService } from './bid.service';
import { BidResponse } from './entities/bid-response.entity';
import { Bid } from './entities/bid.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Bid,
      BidResponse,
      User,
      FabricPricingModuleEntity,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => FabricPricingModule),
    forwardRef(() => FabricQuantityModule),
    forwardRef(() => CuttingModule),
    forwardRef(() => LogoPrintingModule),
    forwardRef(() => PackagingModule),
    forwardRef(() => StitchingModule),
    forwardRef(() => UsersModule),
    forwardRef(() => OrderModule),
  ],
  controllers: [BidController],
  providers: [BidService],
  exports: [BidService],
})
export class BidModule { }

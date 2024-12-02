import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FabricSizeCalculation } from '../entities/fabric-size-calculation.entity';
import { FabricPricing } from '../entities/fabric-pricing.entity';
import { LogoSizes } from '../entities/logo-sizes.entity';
import { PackagingBags } from '../entities/packaging-bags.entity';
import { RegularCutting } from '../entities/regular-cutting.entity';
import { ShirtTypes } from '../entities/shirt-type.entity';
import { Stitching } from '../entities/stitching.entity';
import { SublimationCutting } from '../entities/sublimation-cutting.entity';
import { BottomHem } from '../entities/bottom-hem.entity';
import { CenterChest } from '../entities/center-chest.entity';
import { FullBack } from '../entities/full-back.entity';
import { FullFront } from '../entities/full-front.entity';
import { LeftChest } from '../entities/left-chest.entity';
import { OversizedFront } from '../entities/oversized-front.entity';
import { Sleeves } from '../entities/sleeves.entity';
import { UpperBack } from '../entities/upper-back.entity';
import { SeederService } from './seeder.service';
import { SeederController } from './seeder.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FabricSizeCalculation,
      FabricPricing,
      LogoSizes,
      PackagingBags,
      RegularCutting,
      ShirtTypes,
      Stitching,
      SublimationCutting,
      BottomHem,
      CenterChest,
      FullBack,
      FullFront,
      LeftChest,
      OversizedFront,
      Sleeves,
      UpperBack,
    ]),
  ],
  providers : [SeederService],
  controllers : [SeederController]
})
export class SeederModule {}
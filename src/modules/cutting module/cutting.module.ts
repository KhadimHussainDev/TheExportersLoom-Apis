import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegularCutting, SublimationCutting } from '../../entities';
import { UsersModule } from '../../users/users.module';
import { CuttingController } from './cutting.controller';
import { CuttingService } from './cutting.service';
import { Cutting } from './entities/cutting.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cutting, RegularCutting, SublimationCutting]),
    forwardRef(() => UsersModule),
  ],
  controllers: [CuttingController],
  providers: [CuttingService],
  exports: [CuttingService],
})
export class CuttingModule { }

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FabricSizeCalculation } from '../../entities/fabric-size-calculation.entity';
import { Project } from '../../project/entities/project.entity';
import { UsersModule } from '../../users/users.module';
import { FabricQuantity } from './entities/fabric-quantity.entity';
import { FabricQuantityController } from './fabric-quantity.controller';
import { FabricQuantityService } from './fabric-quantity.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FabricQuantity, FabricSizeCalculation, Project]),
    forwardRef(() => UsersModule),
  ],
  controllers: [FabricQuantityController],
  providers: [FabricQuantityService],
  exports: [FabricQuantityService],
})
export class FabricQuantityModule { }

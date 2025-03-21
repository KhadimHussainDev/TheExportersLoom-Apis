import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BidModule } from '../bid/bid.module';
import { MachineModule } from '../machines/machine.module';
import { UsersModule } from '../users/users.module';
import { Order } from './entities/order.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    forwardRef(() => BidModule),
    forwardRef(() => UsersModule),
    MachineModule,
  ],
  providers: [OrderService],
  controllers: [OrderController],
  exports: [OrderService, TypeOrmModule]
})
export class OrderModule { }

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackagingBags } from '../../entities/packaging-bags.entity';
import { UsersModule } from '../../users/users.module';
import { Packaging } from './entities/packaging.entity';
import { PackagingController } from './packaging.controller';
import { PackagingService } from './packaging.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Packaging, PackagingBags]),
    forwardRef(() => UsersModule),
  ],
  controllers: [PackagingController],
  providers: [PackagingService],
  exports: [PackagingService],
})
export class PackagingModule { }

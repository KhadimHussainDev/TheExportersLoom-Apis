import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogoSizes } from '../../entities/logo-sizes.entity';
import { UsersModule } from '../../users/users.module';
import { LogoPrinting } from './entities/logo-printing.entity';
import { LogoPrintingController } from './logo-printing.controller';
import { LogoPrintingService } from './logo-printing.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([LogoPrinting, LogoSizes]),
    forwardRef(() => UsersModule),
  ],
  controllers: [LogoPrintingController],
  providers: [LogoPrintingService],
  exports: [LogoPrintingService],
})
export class LogoPrintingModule { }

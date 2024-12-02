import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogoPrintingController } from './logo-printing.controller';
import { LogoPrintingService } from './logo-printing.service';
import { LogoPrinting } from './entities/logo-printing.entity';
import { ProjectModule } from '../../project/project.module';
import { BidModule } from '../../bid/bid.module'; // Import BidModule to access BidService

@Module({
  imports: [
    TypeOrmModule.forFeature([LogoPrinting]),
    forwardRef(() => ProjectModule),
    forwardRef(() => BidModule),
  ],
  controllers: [LogoPrintingController],
  providers: [LogoPrintingService],
  exports: [LogoPrintingService],
})
export class LogoPrintingModule {}

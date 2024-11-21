// src/modules/logo-printing-module/logo-printing.module.ts
import { Module, forwardRef  } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogoPrintingController } from './logo-printing.controller';
import { LogoPrintingService } from './logo-printing.service';
import { LogoPrinting } from './entities/logo-printing.entity';
// import { ProjectModule } from 'src/project/project.module';
import { ProjectModule } from '../../project/project.module';

@Module({
  imports: [TypeOrmModule.forFeature([LogoPrinting]), forwardRef(() =>ProjectModule)],
  controllers: [LogoPrintingController],
  providers: [LogoPrintingService],
  exports: [LogoPrintingService],
})
export class LogoPrintingModule {}
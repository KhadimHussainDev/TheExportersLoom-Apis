// src/modules/logo-printing-module/logo-printing.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogoPrintingController } from './logo-printing.controller';
import { LogoPrintingService } from './logo-printing.service';
import { LogoPrinting } from './entities/logo-printing.entity';
import { ProjectModule } from 'src/project/project.module';

@Module({
  imports: [TypeOrmModule.forFeature([LogoPrintingModule]), ProjectModule],  controllers: [LogoPrintingController],
  providers: [LogoPrintingService],
})
export class LogoPrintingModule {
  project: any;
}

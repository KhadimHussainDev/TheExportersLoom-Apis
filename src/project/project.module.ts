import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { Project } from './entities/project.entity';
import { Module as ProjectModuleEntity } from './entities/module.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, ProjectModuleEntity, User]), // Register entities with TypeORM
  ],
  controllers: [ProjectController], // Register the controller
  providers: [ProjectService], // Register the service
  exports: [ProjectService], // Export service for use in other modules if needed
})
export class ProjectModule {}

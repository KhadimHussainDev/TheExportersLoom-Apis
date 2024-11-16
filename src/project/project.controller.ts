import { Controller, Post, Body } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectDto } from './dto/create-project.dto';
import { Project } from './entities/project.entity';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async createProject(@Body() createProjectDto: ProjectDto): Promise<Project> {
    return await this.projectService.createProject(createProjectDto);
  }
}

import { Controller, Post, Body, NotFoundException, Get, Param, Delete } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectDto } from './dto/create-project.dto';
import { Project } from './entities/project.entity';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async createProject(@Body() createProjectDto: ProjectDto): Promise<Project> {
    console.log('Received project data in controller:', createProjectDto); // Log received data
    return await this.projectService.createProject(createProjectDto);
  }

  // Get all projects
  @Get()
  async getAllProjects(): Promise<Project[]> {
    const projects = await this.projectService.getAllProjects();
    
    if (!projects || projects.length === 0) {
      throw new NotFoundException('No projects found.');
    }

    return projects;
  }

  // Get a specific project by ID
  @Get(':id')
  async getProjectById(@Param('id') id: number): Promise<Project> {
    return await this.projectService.getProjectById(id);
  }

  //delete project by id 
  @Delete(':id')
  async deleteProject(@Param('id') projectId: number): Promise<string> {
    try {
      return await this.projectService.deleteProject(projectId);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
import { 
  Controller, Post, Body, NotFoundException, Get, Param, Delete, Put 
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  /** Create a new project */
  @Post()
  async createProject(@Body() createProjectDto: CreateProjectDto): Promise<Project> {
    return await this.projectService.createProject(createProjectDto);
  }

  /** Get all projects */
  @Get()
  async getAllProjects(): Promise<Project[]> {
    const projects = await this.projectService.getAllProjects();
    
    if (!projects || projects.length === 0) {
      throw new NotFoundException('No projects found.');
    }
    return projects;
  }

  /** Get project by ID */
  @Get(':id')
  async getProjectById(@Param('id') id: number): Promise<Project> {
    const project = await this.projectService.getProjectById(id);
    
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found.`);
    }

    return project;
  }

  /** Delete project by ID */
  @Delete(':id')
  async deleteProject(@Param('id') projectId: number): Promise<{ message: string }> {
    try {
      await this.projectService.deleteProject(projectId);
      return { message: `Project with ID ${projectId} deleted successfully.` };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /** Edit project by ID */
  // @Put(':projectId')
  // async editProject(
  //   @Param('projectId') projectId: number,
  //   @Body() updateProjectDto: UpdateProjectDto
  // ): Promise<Project> {
  //   const updatedProject = await this.projectService.editProject(projectId, updateProjectDto);
    
  //   if (!updatedProject) {
  //     throw new NotFoundException(`Project with ID ${projectId} not found.`);
  //   }

  //   return updatedProject;
  // }
}

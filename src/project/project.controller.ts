import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put
} from '@nestjs/common';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { ProjectService } from './project.service';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) { }

  /** Create a new project */
  @Post()
  async createProject(@Body() createProjectDto: CreateProjectDto): Promise<ApiResponseDto<Project>> {
    const project = await this.projectService.createProject(createProjectDto);
    return ApiResponseDto.success(
      HttpStatus.CREATED,
      'Project created successfully',
      project
    );
  }

  /** Get all projects */
  @Get()
  async getAllProjects(): Promise<ApiResponseDto<Project[]>> {
    try {
      const projects = await this.projectService.getAllProjects();

      if (!projects || projects.length === 0) {
        throw new NotFoundException('No projects found.');
      }

      return ApiResponseDto.success(
        HttpStatus.OK,
        'Projects retrieved successfully',
        projects
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to retrieve projects: ${error.message}`);
    }
  }

  /** Get project by ID */
  @Get(':id')
  async getProjectById(@Param('id') id: number): Promise<ApiResponseDto<Project>> {
    try {
      const project = await this.projectService.getProjectById(id);

      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found.`);
      }

      return ApiResponseDto.success(
        HttpStatus.OK,
        'Project retrieved successfully',
        project
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to retrieve project: ${error.message}`);
    }
  }

  /** Delete a project */
  @Delete(':id')
  async deleteProject(@Param('id') projectId: number): Promise<ApiResponseDto<any>> {
    try {
      await this.projectService.deleteProject(projectId);

      return ApiResponseDto.success(
        HttpStatus.OK,
        'Project deleted successfully'
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }

  /** Edit a project */
  @Put(':projectId')
  async editProject(
    @Param('projectId') projectId: number,
    @Body() updateProjectDto: UpdateProjectDto
  ): Promise<ApiResponseDto<Project>> {
    try {
      const updatedProject = await this.projectService.editProject(projectId, updateProjectDto);

      return ApiResponseDto.success(
        HttpStatus.OK,
        'Project updated successfully',
        updatedProject
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to update project: ${error.message}`);
    }
  }
}

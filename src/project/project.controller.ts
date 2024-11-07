import {
    Controller,
    Get,
    Post,
    Param,
    Body,
    Put,
    Delete,
    Patch,
    Request,
    UseGuards,
  } from '@nestjs/common';
  import { ProjectService } from './project.service';
  import { CreateProjectDto } from './dto/create-project.dto';
  import { UpdateProjectDto } from './dto/project.dto';
  import { CreateModuleDto } from './dto/create-module.dto';
  import { JwtStrategy } from '../auth/jwt.strategy'; // Use JwtStrategy
  import { User } from '../users/entities/user.entity';
  
  @UseGuards(JwtStrategy) // Protect all routes in this controller with JWT authentication
  @Controller('projects')
  export class ProjectController {
    constructor(private readonly projectService: ProjectService) {}
  
    @Post()
    async createProject(
      @Body() createProjectDto: CreateProjectDto,
      @Request() req,
    ) {
      const user: User = req.user; // JWT Guard populates req.user
      return this.projectService.createProject(createProjectDto, user);
    }
  
    @Get()
    findAllProjectsForUser(@Request() req) {
      const user: User = req.user;
      return this.projectService.findAllProjectsForUser(user.user_id);
    }
  
    @Get(':id')
    findProjectByIdForUser(@Param('id') id: number, @Request() req) {
      const user: User = req.user;
      return this.projectService.findProjectByIdForUser(id, user.user_id);
    }
  
    @Put(':id')
    updateProject(
      @Param('id') id: number,
      @Body() updateProjectDto: UpdateProjectDto,
      @Request() req,
    ) {
      const user: User = req.user;
      return this.projectService.updateProject(
        id,
        updateProjectDto,
        user.user_id,
      );
    }
  
    @Delete(':id')
    deleteProject(@Param('id') id: number, @Request() req) {
      const user: User = req.user;
      return this.projectService.deleteProject(id, user.user_id);
    }
  
    // Module Endpoints
    @Post(':projectId/modules')
    createModule(
      @Param('projectId') projectId: number,
      @Body() createModuleDto: CreateModuleDto,
    ) {
      return this.projectService.createModule(projectId, createModuleDto);
    }
  
    @Patch('modules/:id/post')
    postModuleForBidding(@Param('id') id: number) {
      return this.projectService.postModuleForBidding(id);
    }
  
    @Get(':projectId/modules')
    findModulesByProject(@Param('projectId') projectId: number) {
      return this.projectService.findModulesByProject(projectId);
    }
  }
  
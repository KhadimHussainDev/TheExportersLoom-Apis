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
  UnauthorizedException,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/project.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { AuthGuard } from '@nestjs/passport';
import { CustomRequest } from '../users/custom-request.interface';

@UseGuards(AuthGuard('jwt')) // Use AuthGuard with 'jwt' strategy
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) { }

  @Post()
  async createProject(@Body() createProjectDto: CreateProjectDto, @Req() req: CustomRequest) {
    const userId = Number(req.user?.user_id); // Convert user_id to number

    if (isNaN(userId)) {
      throw new HttpException('User ID missing or invalid', HttpStatus.UNAUTHORIZED);
    }

    try {
      const project = await this.projectService.createProject(createProjectDto, userId);
      return {
        message: 'Project created successfully',
        project,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async findAllProjectsForUser(@Request() req) {
    return this.projectService.findAllProjectsForUser(req.user.user_id);
  }

  @Get(':id')
  async findProjectByIdForUser(@Param('id') id: number, @Request() req) {
    const userId = Number(req.user?.user_id);
    return this.projectService.findProjectByIdForUser(id, userId);
  }

  @Put(':id')
  async updateProject(
    @Param('id') id: number,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req,
  ) {
    console.log('Update project called with ID:', id); // Debugging statement
    const userId = Number(req.user?.user_id);
    return this.projectService.updateProject(id, updateProjectDto, userId);
  }

  @Delete(':id')
  async deleteProject(@Param('id') id: number, @Request() req) {
    const userId = Number(req.user?.user_id);
    await this.projectService.deleteProject(id, userId);
    return { message: 'Project deleted successfully' };
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

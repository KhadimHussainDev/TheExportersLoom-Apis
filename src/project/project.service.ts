import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { Module } from './entities/module.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/project.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>,
  ) {}

  async createProject(createProjectDto: CreateProjectDto, user: User): Promise<Project> {
    const project = this.projectRepository.create({ ...createProjectDto, user });
    return this.projectRepository.save(project);
  }

  findAllProjectsForUser(userId: number): Promise<Project[]> {
    return this.projectRepository.find({
      where: { user: { user_id: userId } },
      relations: ['modules'],
    });
  }

  async findProjectByIdForUser(id: number, userId: number): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id, user: { user_id: userId } },
      relations: ['modules'],
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async updateProject(id: number, updateProjectDto: UpdateProjectDto, userId: number): Promise<Project> {
    const project = await this.findProjectByIdForUser(id, userId);
    Object.assign(project, updateProjectDto);
    return this.projectRepository.save(project);
  }

  async deleteProject(id: number, userId: number): Promise<void> {
    const project = await this.findProjectByIdForUser(id, userId);
    await this.projectRepository.remove(project);
  }

  async createModule(projectId: number, createModuleDto: CreateModuleDto): Promise<Module> {
    const project = await this.projectRepository.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    const module = this.moduleRepository.create({ ...createModuleDto, project, status: 'draft' });
    return this.moduleRepository.save(module);
  }

  async postModuleForBidding(id: number): Promise<Module> {
    const module = await this.moduleRepository.findOne({ where: { id } });
    if (!module) throw new NotFoundException('Module not found');

    module.status = 'posted';
    return this.moduleRepository.save(module);
  }

  findModulesByProject(projectId: number): Promise<Module[]> {
    return this.moduleRepository.find({ where: { project: { id: projectId } } });
  }
}

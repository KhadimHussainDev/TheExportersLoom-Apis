import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Project } from './project.entity';

@Entity()
export class Module {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column('decimal')
  budget: number;

  @Column()
  deadline: Date;

  @Column({ default: 'draft' }) // Initial status is 'draft'
  status: string; // Status can be 'draft', 'posted', 'bidded'

  @ManyToOne(() => Project, (project) => project.modules)
  project: Project; // Associate module with a project
}
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from '../../../project/entities/project.entity'; 

@Entity('cutting')
export class Cutting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  status: string; 

  @Column()
  projectId: number;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  ratePerShirt: number;

  @Column('decimal', { precision: 10, scale: 2 })
  cost: number;

  @Column()
  cuttingStyle: 'regular' | 'sublimation';

  // Relationship to Project entity
  @ManyToOne(() => Project, (project) => project.cuttings)
  @JoinColumn({ name: 'projectId' })
  project: Project;
}

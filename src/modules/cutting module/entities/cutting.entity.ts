// src/modules/cutting-quantity-module/entities/cutting.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../../../project/entities/project.entity'; // Ensure the import is correct

@Entity('cutting')
export class Cutting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  status: string;  // "Active" or other statuses for tracking

  @Column()
  projectId: number;

  @Column()
  quantity: number;  // Quantity of shirts to be cut

  @Column('decimal', { precision: 10, scale: 2 })
  ratePerShirt: number;  // Rate per shirt (rate for cutting)

  @Column('decimal', { precision: 10, scale: 2 })
  cost: number;  // Total cost for the cutting based on quantity and rate

  @Column()
  cuttingStyle: 'regular' | 'sublimation';  // New column to distinguish cutting styles

  // Relationship to Project entity
  @ManyToOne(() => Project, (project) => project.cuttings)
  @JoinColumn({ name: 'projectId' })
  project: Project;
}

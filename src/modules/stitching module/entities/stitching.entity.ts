import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Project } from '../../../project/entities/project.entity';

@Entity('stitching')
export class Stitching {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @ManyToOne(() => Project, (project) => project.stitchingModules)
  project: Project;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  ratePerShirt: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cost: number;
}

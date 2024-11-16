import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Project } from '../../../project/entities/project.entity';

@Entity('packaging_bags')
export class PackagingModule {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Project, (project) => project.packagingModules, { onDelete: 'CASCADE' })
  project: Project;

  @Column()
  status: string;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cost: number;
}

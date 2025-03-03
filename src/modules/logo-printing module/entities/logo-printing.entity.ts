import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../../../project/entities/project.entity';

@Entity('logo_printing')
export class LogoPrinting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  printingMethod: string;

  @Column({ nullable: true })
  logoPosition: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  projectId: number;

  @ManyToOne(() => Project, (project) => project.logoPrintingModules)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ nullable: true })
  status: string;

  @Column('json', { nullable: true })
  sizes: { size: string; quantityRequired: number }[]; 
}

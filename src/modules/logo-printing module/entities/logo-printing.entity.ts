// src/modules/logo-printing-module/entities/logo-printing.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../../../project/entities/project.entity'; // Ensure the correct import path

@Entity('logo_printing')
export class LogoPrinting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  printingMethod: string;

  @Column()
  size: string;

  @Column()
  logoPosition: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;


  @ManyToOne(() => Project, (project) => project.logoPrintingModules)
  project: Project;
}

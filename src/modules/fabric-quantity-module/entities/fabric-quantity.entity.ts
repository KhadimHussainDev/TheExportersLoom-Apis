// src/modules/fabric-quantity-module/entities/fabric-quantity.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../../../project/entities/project.entity'; // Ensure the correct import path

@Entity('fabric_quantity')
export class FabricQuantity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  status: string;

  @Column()
  projectId: number;

  @Column()
  categoryType: string;

  @Column()
  shirtType: string;

  @Column()
  fabricSize: string;

  @Column()
  quantityRequired: number;

  @Column('decimal', { precision: 10, scale: 2 })
  fabricQuantityCost: number;

  // Relationship to Project
  @ManyToOne(() => Project, (project) => project.fabricQuantities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;
}

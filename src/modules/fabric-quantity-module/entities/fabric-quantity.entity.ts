import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany
} from 'typeorm';
import { Project } from '../../../project/entities/project.entity'; // Ensure the correct import path
import { Bid } from '../../../bid/entities/bid.entity';

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
  @ManyToOne(() => Project, (project) => project.fabricQuantities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  // // Add the reverse relationship to Bid entity
  // @OneToMany(() => Bid, (bid) => bid.fabricQuantity)
  // bids: Bid[];
}

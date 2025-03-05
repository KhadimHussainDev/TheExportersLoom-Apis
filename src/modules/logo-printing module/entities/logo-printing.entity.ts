import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../../../project/entities/project.entity';
import { FabricSizeDetailDto } from 'modules/fabric-quantity-module/dto/create-fabric-quantity.dto';

@Entity('logo_printing')
export class LogoPrinting {
  @PrimaryGeneratedColumn()
  id: number;

  
  @Column({ type: 'jsonb', nullable: true }) 
  logoDetails: { logoPosition: string; printingMethod: string }[];
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  projectId: number;

  @ManyToOne(() => Project, (project) => project.logoPrintingModules)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ nullable: true })
  status: string;

  @Column({ type: 'jsonb', nullable: true }) 
  sizes: FabricSizeDetailDto[];
}

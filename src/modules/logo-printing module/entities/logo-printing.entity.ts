import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../../../project/entities/project.entity';
import { FabricSizeDetailDto } from 'modules/fabric-quantity-module/dto/fabricSizeDetails.dto';
import { LogoDetailDto } from '../dto/logo-details.dto';

@Entity('logo_printing')
export class LogoPrinting {
  @PrimaryGeneratedColumn()
  id: number;

  
  @Column({ type: 'jsonb', nullable: true }) 
  logoDetails: LogoDetailDto[];
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

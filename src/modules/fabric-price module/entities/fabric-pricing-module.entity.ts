import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Project } from '../../../project/entities/project.entity';

@Entity('fabric_pricing_module')
export class FabricPricingModule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  category: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subCategory: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Project, (project) => project.fabricPriceModules, {
    onDelete: 'CASCADE',
  })
  project: Project;
}

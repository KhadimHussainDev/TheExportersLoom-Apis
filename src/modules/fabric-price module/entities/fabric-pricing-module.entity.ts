import { Entity, PrimaryGeneratedColumn, Column, ManyToOne,OneToMany } from 'typeorm';
import { Project } from '../../../project/entities/project.entity';
import { Bid } from '../../../bid/entities/bid.entity';
import { STATUS } from 'common';

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

  @Column({ type: 'varchar', length: 255, default: STATUS.DRAFT })
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => Project, (project) => project.fabricPriceModules, {
    onDelete: 'CASCADE',
  })
  project: Project;

  // // Add the reverse relationship to Bid entity
  // @OneToMany(() => Bid, (bid) => bid.fabricPricingModule)
  // bids: Bid[];
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';  // Adjust path as per your structure
import { FabricPricingModule } from '../../modules/fabric-price module/entities/fabric-pricing-module.entity'; 

@Entity('bid')
export class Bid {
  @PrimaryGeneratedColumn()
  bid_id: number;

  @ManyToOne(() => User, user => user.bids)
  @JoinColumn({ name: 'user_id' })  // Ensure the correct column name
  user: User;

  @ManyToOne(() => FabricPricingModule, fabricPricingModule => fabricPricingModule.bids)
  @JoinColumn({ name: 'module_id' })  // Ensure the correct column name
  fabricPricingModule: FabricPricingModule;

  @Column()
  module_id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column()
  status: string;
}
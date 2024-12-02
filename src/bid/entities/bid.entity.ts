import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';  // Adjust path as per your structure
import { FabricPricingModule } from '../../modules/fabric-price module/entities/fabric-pricing-module.entity'; 
import { FabricQuantity } from '../../modules/fabric-quantity-module/entities/fabric-quantity.entity'; 

@Entity('bid')
export class Bid {
  @PrimaryGeneratedColumn()
  bid_id: number;

  @ManyToOne(() => User, user => user.bids)
  @JoinColumn({ name: 'user_id' })  // Ensure the correct column name
  user: User;

  @Column({ type: 'varchar', nullable: false })  // Check if nullable is set correctly
  module_type: string;

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
import { Order } from '../../order/entities/order.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity'; // Adjust path as per your structure
import { BidResponse } from './bid-response.entity';

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

  @OneToOne(() => Order, order => order.bid)
  orders: Order[];

  @OneToMany(() => BidResponse, response => response.bid)
  responses: BidResponse[];
}
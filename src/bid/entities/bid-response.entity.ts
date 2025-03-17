import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Bid } from './bid.entity';
import { STATUS } from 'common';

@Entity()
export class BidResponse {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Bid, (bid) => bid.responses)
  @JoinColumn({ name: 'bid_id' })
  bid: Bid;

  @Column()
  bid_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'manufacturer_id' })
  manufacturer: User;

  @Column()
  manufacturer_id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column()
  machineId: number;

  @Column({ type: 'timestamp', nullable: true })
  deadline: Date;

  @Column({ default: STATUS.PENDING })
  status: string; // pending, accepted, rejected

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
} 
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from '../../order/entities/order.entity';
import { User } from 'users/entities/user.entity';
import { Machine } from 'machines/entities/machine.entity';

@Entity()
export class Reviews {
  @PrimaryGeneratedColumn()
  reviewId: number;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewGiverId' })
  reviewGiver: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewTakerId' })
  reviewTaker: User;

  @ManyToOne(() => Machine)
  @JoinColumn({ name: 'machineId' })
  machine: Machine;

  @Column({ type: 'int', width: 1 })
  rating: number;

  @Column({ type: 'text' })
  reviewText: string;

  @CreateDateColumn()
  reviewDate: Date;
}
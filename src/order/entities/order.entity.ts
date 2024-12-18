import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Bid } from '../../bid/entities/bid.entity';
import { Machine } from 'machines/entities/machine.entity';
import { User } from 'users/entities/user.entity';
import { Reviews } from 'reviews/entities/reviews.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  orderId: number;

  @OneToOne(() => Bid)
  @JoinColumn({ name: 'bidId' })
  bid: Bid;
   
  @ManyToOne(() => User)
  @JoinColumn({ name: 'exporterId' })
  exporter: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'manufacturerId' })
  manufacturer: User;

  @ManyToOne(() => Machine)
  @JoinColumn({ name: 'machineId' })
  machine: Machine;

  @Column()
  status: string;

  @CreateDateColumn()
  createdDate: Date;

  @Column({ type: 'date', nullable: true })
  completionDate: Date;

  @Column({ type: 'date' })
  deadline: Date;

  @OneToMany(() => Reviews, review => review.order)
  reviews: Reviews[];
}
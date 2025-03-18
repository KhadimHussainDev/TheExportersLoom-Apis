import { Entity, PrimaryGeneratedColumn, Column, ManyToOne,Unique,JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Order } from 'order/entities/order.entity';
import { Reviews } from 'reviews/entities/reviews.entity';

@Entity('Machines')
// @Unique(['machine_type', 'machine_model', 'machine_owner'])
export class Machine {
  @PrimaryGeneratedColumn()
  machine_id: number;

  @Column({ type: 'varchar', length: 20 })  
  machine_type: string;

  @Column({ type: 'varchar', length: 100 })  
  machine_model: string;

  @Column({ type: 'varchar', length: 255 })  
  location: string;

  @Column({ type: 'boolean', default: true })  
  availability_status: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  hourly_rate: number;

  @Column({ type: 'text' })  
  description: string;

  @Column({ type: 'varchar', length: 255 })  
  machine_image: string;

  // Many-to-One relationship with User (the machine owner)
  @ManyToOne(() => User, (user) => user.machines, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'machineOwnerUserId' })
  machine_owner: User;

  @OneToMany(() => Order, order => order.machine)
  orders: Order[];
  @OneToMany(() => Reviews, review => review.machine)
  reviews: Reviews[];
}

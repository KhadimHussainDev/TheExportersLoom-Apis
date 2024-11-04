import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('Machines')
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
  machine_owner: User;
}

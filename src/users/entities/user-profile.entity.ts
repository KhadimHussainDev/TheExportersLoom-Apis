import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserProfile {
  @PrimaryGeneratedColumn()
  profile_id: number;

  @Column({ nullable: true })
  name: string;
  
  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  company_name: string;

  @Column({ nullable: true })
  phone_number: string;

  @Column({ nullable: true })
  cnic: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'float', nullable: true })
  rating: number;

  @Column({ nullable: true })
  profile_picture: string;

  @Column({ default: false })
  googleAuth: boolean;

  // Foreign key linking to the User table
  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}

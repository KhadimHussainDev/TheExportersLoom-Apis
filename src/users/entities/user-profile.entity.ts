import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserProfile {
  @PrimaryGeneratedColumn()
  profile_id: number;

  @Column()
  name: string;

  @Column()
  company_name: string;

  @Column()
  phone_number: string;

  @Column()
  cnic: string;

  @Column()
  address: string;

  @Column({ type: 'float', nullable: true })
  rating: number;

  @Column({ nullable: true })
  profile_picture: string;

   // Foreign key reference to User
   @OneToOne(() => User, user => user.profile)  
  user: User;
}

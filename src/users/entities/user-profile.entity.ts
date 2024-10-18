// src/users/entities/user-profile.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
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

    // Foreign key linking to the User table
    @ManyToOne(() => User, user => user.userProfiles)
    @JoinColumn({ name: 'user_id' })  // user_id foreign key
    user: User;
}

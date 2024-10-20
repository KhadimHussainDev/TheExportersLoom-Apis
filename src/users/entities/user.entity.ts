import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserAuthentication } from '../../auth/entities/auth.entity';
import { UserProfile } from './user-profile.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    user_id: number;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column()
    userType: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    registration_date: Date;

    @Column({ default: false })
    profile_verified: boolean;

    @Column({ default: false })
    googleAuth: boolean;  // Mark Google OAuth users

    @Column({ nullable: true })
    picture: string;  // Google profile picture (optional)

    // One-to-Many relationship with UserAuthentication
    @OneToMany(() => UserAuthentication, userAuth => userAuth.user)
    userAuth: UserAuthentication[];

    // One-to-Many relationship with UserProfile
    @OneToMany(() => UserProfile, userProfile => userProfile.user)
    userProfiles: UserProfile[];
}

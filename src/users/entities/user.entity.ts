import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
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

  // One-to-One relationship with UserProfile
  @OneToOne(() => UserProfile, (userProfile) => userProfile.user, { cascade: true })
  @JoinColumn()  // Join user with profile
  profile: UserProfile;  // Correct the property name to 'profile'

  // One-to-Many relationship with UserAuthentication
  @OneToMany(() => UserAuthentication, (userAuth) => userAuth.user)
  userAuth: UserAuthentication[];
}

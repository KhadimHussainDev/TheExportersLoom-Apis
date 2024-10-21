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

  // One-to-one relationship with UserProfile
  @OneToOne(() => UserProfile, (profile) => profile.user, { cascade: true })
  @JoinColumn()  // This tells TypeORM which table holds the foreign key
  profile: UserProfile;

  // One-to-Many relationship with UserAuthentication
  @OneToMany(() => UserAuthentication, userAuth => userAuth.user)
  userAuth: UserAuthentication[];
}

import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, ManyToOne } from 'typeorm';
import { UserAuthentication } from '../../auth/entities/auth.entity';
import { UserProfile } from './user-profile.entity';
import { Machine } from 'src/machines/entities/machine.entity';
import { Project } from 'src/project/entities/project.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: 'exporter', nullable: false })  
  userType: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  registration_date: Date;

  @Column({ default: false })
  profile_verified: boolean;

  @Column({ default: false })
  googleAuth: boolean;  

  @Column({ nullable: true })
  picture: string;  

  @Column({ default: true })
  isActive: boolean;

  // One-to-One relationship with UserProfile
  @OneToOne(() => UserProfile, (userProfile) => userProfile.user)
  @JoinColumn()  
  profile: UserProfile;  

  // One-to-Many relationship with UserAuthentication
  @OneToMany(() => UserAuthentication, (userAuth) => userAuth.user)
  userAuth: UserAuthentication[];

  @OneToMany(() => Machine, (machine) => machine.machine_owner)
  machines: Machine[];

  @OneToMany(() => Project, (project) => project.user)
  projects: Project[];
  
}

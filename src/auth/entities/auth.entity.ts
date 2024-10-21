// src/auth/entities/auth.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class UserAuthentication {
    @PrimaryGeneratedColumn()
    authID: number;

    @Column()
    passwordHash: string;

    @Column({ default: false })
    TwoFactorEnabled: boolean;

    @Column({ default: false })
    isEmailVerified: boolean;

    @Column({ default: false })
    isPhoneVerified: boolean;

    @Column({ nullable: true })
    VerificationToken: string;

    @Column({ type: 'timestamp', nullable: true })
    LastPasswordChange: Date;

    @Column({ default: 0 })
    FailedLoginAttempts: number;

    @Column({ nullable: true })
    PasswordResetToken: string;

    @ManyToOne(() => User, (user) => user.userAuth)  // Foreign key to User
    @JoinColumn({ name: 'user_id' }) // Explicit foreign key column
    user: User;
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Module } from './module.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column('decimal')
  budget: number;

  @Column()
  deadline: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  
  @ManyToOne(() => User, (user) => user.projects)
@JoinColumn({ name: 'user_id' })
user: User;

  @OneToMany(() => Module, (module) => module.project, { cascade: true })
  modules: Module[];
}

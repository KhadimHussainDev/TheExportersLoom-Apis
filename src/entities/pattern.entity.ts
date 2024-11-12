import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pattern')
export class PatternEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  size: string;

  @Column('decimal', { precision: 5, scale: 2 })
  cost: number;
}

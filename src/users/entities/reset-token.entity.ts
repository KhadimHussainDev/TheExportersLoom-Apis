import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ResetToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @Column()
  userId: number;

  @Column()
  expiryDate: Date;
}

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('shirt_types')
export class ShirtTypes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  shirtType: string;
}

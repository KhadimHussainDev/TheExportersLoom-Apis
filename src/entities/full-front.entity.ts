import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('full_front')
export class FullFront {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  printingMethod: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  size8x10: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  size10x12: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  size12x14: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  size14x16: string;
}

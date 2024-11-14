import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('oversized_front')
export class OversizedFront {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  logoPosition: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  size10x12: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  size12x14: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  size14x16: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  size16x18: string;
}

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('left_chest')
export class LeftChest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  printingMethod: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  size2_5x2_5: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  size3x3: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  size3_5x3_5: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  size4x4: string;
}

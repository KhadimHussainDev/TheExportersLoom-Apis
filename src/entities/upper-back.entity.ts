import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('upper_back')
export class UpperBack {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  logoPosition: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  size5x5: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  size6x6: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  size7x7: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  size8x8: string;
}

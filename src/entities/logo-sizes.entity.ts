import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('logo_sizes')
export class LogoSizes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  logoPosition: string;

  @Column({ type: 'varchar', length: 50 })
  smallSize: string;

  @Column({ type: 'varchar', length: 50 })
  mediumSize: string;

  @Column({ type: 'varchar', length: 50 })
  largeSize: string;

  @Column({ type: 'varchar', length: 50 })
  xlSize: string;
}

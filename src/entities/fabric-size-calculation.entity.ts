import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('fabric_size_calculation')
export class FabricSizeCalculation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  shirtType: string;

  @Column({ type: 'varchar', length: 255 })
  fabricType: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  smallSize: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  mediumSize: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  largeSize: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  xlSize: number;
}

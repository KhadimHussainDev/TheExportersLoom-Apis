import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('fabric_pricing') // Source table for pricing data
export class FabricPricing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  category: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subCategory: string;

  @Column({ type: 'varchar', length: 100 })
  price: string;

  @Column({ type: 'text', nullable: true })
  description: string;
}

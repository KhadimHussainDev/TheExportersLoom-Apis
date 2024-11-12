import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('fabric_pricing')
export class FabricPricing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  category: string;

  @Column({ type: 'varchar', length: 255 })
  subCategory: string;

  @Column({ type: 'varchar', length: 100 })
  price: string;

  @Column({ type: 'text', nullable: true })
  description: string;
}

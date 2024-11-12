import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('regular_cutting')
export class RegularCutting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  quantityOfShirts: string;

  @Column({ type: 'varchar', length: 50 })
  ratePerShirt: string;

  @Column({ type: 'varchar', length: 100 })
  totalCost: string;
}

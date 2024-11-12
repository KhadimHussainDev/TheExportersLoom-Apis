import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sublimation_cutting')
export class SublimationCutting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  quantityOfShirts: string;

  @Column({ type: 'varchar', length: 50 })
  ratePerShirt: string;

  @Column({ type: 'varchar', length: 100 })
  totalCost: string;
}

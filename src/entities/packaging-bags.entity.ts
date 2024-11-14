import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('packaging_bags')
export class PackagingBags {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  numberOfShirts: number;

  @Column({ type: 'int' })
  packagingCost: number;
}

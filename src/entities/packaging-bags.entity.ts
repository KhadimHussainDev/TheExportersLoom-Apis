import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('packaging_bags')
export class PackagingBags {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true }) 
  numberOfShirts: string;

  @Column({ type: 'int' })
  packagingCost: number;
}

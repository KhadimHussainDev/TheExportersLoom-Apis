import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { FabricPricingModule } from '../../modules/fabric-price module/entities/fabric-pricing-module.entity';
import { FabricQuantity } from '../../modules/fabric-quantity-module/entities/fabric-quantity.entity';
import { Cutting } from '../../modules/cutting module/entities/cutting.entity';
import { LogoPrinting } from '../../modules/logo-printing module/entities/logo-printing.entity';
import { Stitching } from '../../modules/stitching module/entities/stitching.entity';
import { Packaging } from '../../modules/packaging module/entities/packaging.entity';
import { User } from '../../users/entities/user.entity';

@Entity('project')
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.projects, { nullable: true })
   @JoinColumn({ name: 'userId' })  
   user: User;

  @Column({ nullable: true })
  responseId: number;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string; 
  
  @Column()
  shirtType: string;

  @Column()
  fabricCategory: string;

  @Column({ nullable: true })
  fabricSubCategory: string;

  @Column()
  fabricSize: string;

  @Column({ nullable: true })
  logoPosition: string;

  @Column({ nullable: true })
  printingStyle: string;

  @Column({ nullable: true })
  logoSize: string;

  @Column({ nullable: true })
  cuttingStyle: string;

  @Column()
  quantity: number;

 
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalEstimatedCost: number;

  @OneToMany(() => FabricPricingModule, (fabricPricingModule) => fabricPricingModule.project)
  fabricPriceModules: FabricPricingModule[];

  @OneToMany(() => FabricQuantity, (module) => module.project)
  fabricQuantities: FabricQuantity[];

  @OneToMany(() => Cutting, (module) => module.project)
  cuttings: Cutting[];

  @OneToMany(() => LogoPrinting, (module) => module.project)
  logoPrintingModules: LogoPrinting[];

  @OneToMany(() => Stitching, (module) => module.project)
  stitchingModules: Stitching[];

  @OneToMany(() => Packaging, (module) => module.project)
  packagingModules: Packaging[];
}

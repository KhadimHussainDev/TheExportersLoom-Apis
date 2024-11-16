import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { FabricPricing } from '../../modules/fabric-price module/entities/fabric-pricing.entity';
import { PackagingModule } from '../../modules/packaging module/entities/packaging.entity';
import { Stitching } from '../../modules/stitching module/entities/stitching.entity'; 
import { FabricQuantityModule } from 'src/modules/fabric-quantity module/fabric-quantity.module';
import { FabricQuantity } from 'src/modules/fabric-quantity module/entities/fabric-quantity.entity';
import { CuttingModule } from 'src/modules/cutting module/cutting.controller';
import { Cutting } from 'src/modules/cutting module/entities/cutting.entity';
import { LogoPrintingModule } from 'src/modules/logo-printing module/logo-printing.module';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ nullable: true })
  responseId: number;

  @Column()
  status: string;

  @Column()
  shirtType: string;

  @Column()
  fabricCategory: string;

  @Column({ nullable: true })
  fabricSubCategory: string;

  @Column()
  fabricSize: string;

  @Column()
  logoPosition: string;

  @Column()
  printingStyle: string;

  @Column()
  logoSize: string;

  @Column()
  cuttingStyle: string;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalEstimatedCost: number;


  // Relationship with FabricQuantity
  @OneToMany(() => FabricQuantity, (fabricQuantity) => fabricQuantity.project)
  fabricQuantities: FabricQuantity[];

  @OneToMany(() => FabricPricing, (fabricPricing) => fabricPricing.project)
  fabricPriceModules: FabricPricing[];

  @OneToMany(() => FabricPricing, (module) => module.project)
  fabricPricingModule: FabricPricing[];

  @OneToMany(() => LogoPrintingModule, (logoPrintingModule) => logoPrintingModule.project)
  logoPrintingModules: LogoPrintingModule[];
  
  @OneToMany(() => Cutting, (cutting) => cutting.project) 
  cuttings: Cutting[];

  @OneToMany(() => Stitching, (stitching) => stitching.project) 
  stitchingModules: Stitching[];

  @OneToMany(() => PackagingModule, (module) => module.project)
  packagingModules: PackagingModule[];
}

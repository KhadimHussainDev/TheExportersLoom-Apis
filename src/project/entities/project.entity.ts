import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { FabricPricing } from '../../modules/fabric-price module/entities/fabric-pricing.entity';
import { FabricQuantity } from '../../modules/fabric-quantity-module/entities/fabric-quantity.entity';
import { Cutting } from '../../modules/cutting module/entities/cutting.entity';
import { LogoPrinting } from '../../modules/logo-printing module/entities/logo-printing.entity';
import { Stitching } from '../../modules/stitching module/entities/stitching.entity';
import { PackagingModule } from '../../modules/packaging module/entities/packaging.entity';
import {Module} from './module.entity';

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

  @OneToMany(() => Module, (module) => module.project)
modules: Module[];


  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalEstimatedCost: number;

  @OneToMany(() => FabricPricing, (module) => module.project)
  fabricPriceModules: FabricPricing[];

  @OneToMany(() => FabricQuantity, (module) => module.project)
  fabricQuantities: FabricQuantity[];

  @OneToMany(() => Cutting, (module) => module.project)
  cuttings: Cutting[];

  @OneToMany(() => LogoPrinting, (module) => module.project)
  logoPrintingModules: LogoPrinting[];

  @OneToMany(() => Stitching, (module) => module.project)
  stitchingModules: Stitching[];

  @OneToMany(() => PackagingModule, (module) => module.project)
  packagingModules: PackagingModule[];
}

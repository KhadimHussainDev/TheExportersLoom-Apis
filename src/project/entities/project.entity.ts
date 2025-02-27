import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
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

  @Column({ nullable: true }) // Allows NULL values
  shirtType: string;

  @Column({ nullable: true })
  fabricCategory: string;

  @Column({ nullable: true })
  fabricSubCategory: string;

  @Column({ nullable: true })
  cuttingStyle: string;

  /** New fields added */
  @Column({ nullable: true })
  labelType: string;

  @Column({ type: 'boolean', default: false })
  labelsRequired: boolean;

  @Column({ type: 'integer', nullable: true })
  numberOfLogos: number;

  @Column({ type: 'boolean', default: false })
  packagingRequired: boolean;

  @Column({ nullable: true })
  packagingType: string;

  @Column({ type: 'boolean', default: false })
  patternRequired: boolean;

  @Column({ type: 'boolean', default: false })
  tagCardsRequired: boolean;

  /** JSONB fields for logo details and sizes */
  @Column({ type: 'jsonb', nullable: true })
  logoDetails: { logoPosition: string; printingStyle: string; logoSize: string }[];

  @Column({ type: 'jsonb', nullable: true })
  sizes: { quantity: number; fabricSize: string }[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalEstimatedCost: number;

  /** Relationships */
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

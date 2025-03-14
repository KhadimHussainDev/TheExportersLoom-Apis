import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BottomHem } from '../entities/bottom-hem.entity';
import { FabricPricing } from '../entities/fabric-pricing.entity';
import { FabricSizeCalculation } from '../entities/fabric-size-calculation.entity';
import { LogoSizes } from '../entities/logo-sizes.entity';
import { ShirtTypes } from '../entities/shirt-type.entity';

@Injectable()
export class ProductConfigurationService {
  constructor(
    @InjectRepository(LogoSizes)
    private logoSizesRepository: Repository<LogoSizes>,

    @InjectRepository(BottomHem)
    private bottomHemRepository: Repository<BottomHem>,

    @InjectRepository(FabricPricing)
    private fabricPricingRepository: Repository<FabricPricing>,

    @InjectRepository(ShirtTypes)
    private shirtTypesRepository: Repository<ShirtTypes>,

    @InjectRepository(FabricSizeCalculation)
    private fabricSizeCalculationRepository: Repository<FabricSizeCalculation>,
  ) { }

  /**
   * Get all distinct logo positions 
   */
  async getLogoPositions(): Promise<string[]> {
    const result = await this.logoSizesRepository
      .createQueryBuilder('logo_sizes')
      .select('DISTINCT logo_sizes.logoPosition', 'logoPosition')
      .getRawMany();

    return result.map(item => item.logoPosition);
  }

  /**
   * Get all distinct printing methods 
   */
  async getPrintingMethods(): Promise<string[]> {
    const result = await this.bottomHemRepository
      .createQueryBuilder('bottom_hem')
      .select('DISTINCT bottom_hem.printingMethod', 'printingMethod')
      .getRawMany();

    return result.map(item => item.printingMethod);
  }

  /**
   * Get all fabric types that can be used for a specific shirt type
   */
  async getCategories(shirtType: string): Promise<string[]> {
    const result = await this.fabricSizeCalculationRepository
      .createQueryBuilder('fabric_size_calculation')
      .select('DISTINCT fabric_size_calculation.fabricType', 'fabricType')
      .where('LOWER(fabric_size_calculation.shirtType) = LOWER(:shirtType)', { shirtType })
      .getRawMany();

    return result.map(item => item.fabricType);
  }

  /**
   * Get all subcategories for a specific category 
   */
  async getSubcategories(category: string): Promise<string[]> {
    const result = await this.fabricPricingRepository
      .createQueryBuilder('fabric_pricing')
      .select('DISTINCT fabric_pricing.subCategory', 'subCategory')
      .where('LOWER(fabric_pricing.category) = LOWER(:category)', { category })
      .getRawMany();

    return result.map(item => item.subCategory);
  }

  /**
   * Get all product types 
   */
  async getProductTypes(): Promise<string[]> {
    const result = await this.shirtTypesRepository
      .createQueryBuilder('shirt_types')
      .select('DISTINCT shirt_types.shirtType', 'shirtType')
      .getRawMany();

    return result.map(item => item.shirtType);
  }
} 
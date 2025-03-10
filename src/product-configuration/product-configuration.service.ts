import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BottomHem } from '../entities/bottom-hem.entity';
import { FabricPricing } from '../entities/fabric-pricing.entity';
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
   * Get all unique categories 
   */
  async getCategories(): Promise<string[]> {
    const result = await this.fabricPricingRepository
      .createQueryBuilder('fabric_pricing')
      .select('DISTINCT fabric_pricing.category', 'category')
      .getRawMany();

    return result.map(item => item.category);
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
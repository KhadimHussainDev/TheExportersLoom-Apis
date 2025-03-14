import { Controller, Get, Query } from '@nestjs/common';
import { ProductConfigurationService } from './product-configuration.service';

@Controller('product-configuration')
export class ProductConfigurationController {
  constructor(
    private readonly productConfigurationService: ProductConfigurationService,
  ) { }

  @Get('logo-positions')
  async getLogoPositions(): Promise<string[]> {
    return this.productConfigurationService.getLogoPositions();
  }

  @Get('printing-methods')
  async getPrintingMethods(): Promise<string[]> {
    return this.productConfigurationService.getPrintingMethods();
  }

  @Get('categories')
  async getCategories(@Query('shirtType') shirtType: string): Promise<string[]> {
    return this.productConfigurationService.getCategories(shirtType);
  }

  @Get('subcategories')
  async getSubcategories(@Query('category') category: string): Promise<string[]> {
    return this.productConfigurationService.getSubcategories(category);
  }

  @Get('product-types')
  async getProductTypes(): Promise<string[]> {
    return this.productConfigurationService.getProductTypes();
  }
} 
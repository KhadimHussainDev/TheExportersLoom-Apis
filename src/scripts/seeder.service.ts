import { Injectable, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import {
  BottomHem,
  CenterChest,
  FabricPricing,
  FabricSizeCalculation,
  FullBack,
  FullFront,
  LeftChest,
  LogoSizes,
  OversizedFront,
  PackagingBags,
  RegularCutting,
  ShirtTypes,
  Sleeves,
  Stitching,
  SublimationCutting,
  UpperBack,
} from 'entities';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { AppModule } from '../app.module';
dotenv.config(); // Load environment variables from .env

console.log('JWT_SECRET from dotenv:', process.env.JWT_SECRET);
console.log('Environment Variables:', process.env);
@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
  ) { }
  loadSheetData(filePath: string): any[] {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet);
  }

  async saveData(
    repository: Repository<any>,
    data: any[],
    entityName: string,
  ) {
    try {
      // Check if any data exists in the table by counting records
      const existingRecordsCount = await repository.count();

      // If there are existing records, log the "already exists" message
      if (existingRecordsCount > 0) {
        console.log(`${entityName} data already populated, skipping...`);
      } else {
        // If no data exists, proceed to populate the data
        for (const row of data) {
          await repository.save(row);
        }
        console.log(`${entityName} data populated successfully.`);
      }
    } catch (error) {
      console.error(`Error saving ${entityName} data:`, error);
    }
  }
  async populateData() {
    const app = await NestFactory.createApplicationContext(AppModule);
    console.log('Loaded JWT_SECRET:', process.env.JWT_SECRET);

    const repositories = {
      fabricSizeRepo: app.get<Repository<FabricSizeCalculation>>(
        'FabricSizeCalculationRepository',
      ),
      fabricPricingRepo: app.get<Repository<FabricPricing>>(
        'FabricPricingRepository',
      ),
      logoSizesRepo: app.get<Repository<LogoSizes>>('LogoSizesRepository'),
      packagingBagsRepo: app.get<Repository<PackagingBags>>(
        'PackagingBagsRepository',
      ),
      regularCuttingRepo: app.get<Repository<RegularCutting>>(
        'RegularCuttingRepository',
      ),
      shirtTypesRepo: app.get<Repository<ShirtTypes>>('ShirtTypesRepository'),
      stitchingRepo: app.get<Repository<Stitching>>('StitchingRepository'),
      sublimationCuttingRepo: app.get<Repository<SublimationCutting>>(
        'SublimationCuttingRepository',
      ),
      bottomHemRepo: app.get<Repository<BottomHem>>('BottomHemRepository'),
      centerChestRepo: app.get<Repository<CenterChest>>('CenterChestRepository'),
      fullBackRepo: app.get<Repository<FullBack>>('FullBackRepository'),
      fullFrontRepo: app.get<Repository<FullFront>>('FullFrontRepository'),
      leftChestRepo: app.get<Repository<LeftChest>>('LeftChestRepository'),
      oversizedFrontRepo: app.get<Repository<OversizedFront>>(
        'OversizedFrontRepository',
      ),
      sleevesRepo: app.get<Repository<Sleeves>>('SleevesRepository'),
      upperBackRepo: app.get<Repository<UpperBack>>('UpperBackRepository'),
    };

    const filePaths = {
      fabricSizeFile:
        process.env.FABRIC_SIZE_FILE_PATH ||
        './data/Shirts/Fabric Size Calculation.xlsx',
      fabricPricingFile:
        process.env.FABRIC_PRICING_FILE_PATH ||
        './data/Shirts/Fabric Pricing.xlsx',
      logoSizesFile:
        process.env.LOGO_SIZES_FILE_PATH || './data/Shirts/Logo Sizes.xlsx',
      packagingBagsFile:
        process.env.PACKAGING_BAGS_FILE_PATH ||
        './data/Shirts/Packging Bags.xlsx',
      regularCuttingFile:
        process.env.REGULAR_CUTTING_FILE_PATH ||
        './data/Shirts/Regular Cutting of Shirts.xlsx',
      shirtTypesFile:
        process.env.SHIRT_TYPES_FILE_PATH || './data/Shirts/Shirt Types.xlsx',
      stitchingFile:
        process.env.STITCHING_FILE_PATH || './data/Shirts/Stitching.xlsx',
      sublimationCuttingFile:
        process.env.SUBLIMATION_CUTTING_FILE_PATH ||
        './data/Shirts/Sublimation Cutting of Shirts.xlsx',
      bottomHemFile:
        process.env.BOTTOM_HEM_FILE_PATH ||
        './data/Shirts/Logo Pricing/Bottom Hem.xlsx',
      centerChestFile:
        process.env.CENTER_CHEST_FILE_PATH ||
        './data/Shirts/Logo Pricing/Center Chest.xlsx',
      fullBackFile:
        process.env.FULL_BACK_FILE_PATH ||
        './data/Shirts/Logo Pricing/Full Back.xlsx',
      fullFrontFile:
        process.env.FULL_FRONT_FILE_PATH ||
        './data/Shirts/Logo Pricing/Full Front.xlsx',
      leftChestFile:
        process.env.LEFT_CHEST_FILE_PATH ||
        './data/Shirts/Logo Pricing/Left Chest.xlsx',
      oversizedFrontFile:
        process.env.OVERSIZED_FRONT_FILE_PATH ||
        './data/Shirts/Logo Pricing/Oversized Front.xlsx',
      sleevesFile:
        process.env.SLEEVES_FILE_PATH ||
        './data/Shirts/Logo Pricing/Sleeves.xlsx',
      upperBackFile:
        process.env.UPPER_BACK_FILE_PATH ||
        './data/Shirts/Logo Pricing/Upper Back.xlsx',
    };





    // Data loading and saving for each entity
    await this.saveData(
      repositories.fabricSizeRepo,
      this.loadSheetData(filePaths.fabricSizeFile).map((row) => ({
        shirtType: row['Shirt Type']?.trim(),
        fabricType: row['Fabric Type']?.trim(),
        smallSize: parseFloat(row['Small (kg)']) || null,
        mediumSize: parseFloat(row['Medium (kg)']) || null,
        largeSize: parseFloat(row['Large (kg)']) || null,
        xlSize: parseFloat(row['XL (kg)'] || row['X-Large (kg)']) || null,
      })),
      'Fabric Size Calculation',
    );

    await this.saveData(
      repositories.fabricPricingRepo,
      this.loadSheetData(filePaths.fabricPricingFile).map((row) => ({
        category: row['Category']?.trim(),
        subCategory: row['Sub-Category']?.trim(),
        price: row['Price']?.trim(),
        description: row['Description']?.trim(),
      })),
      'Fabric Pricing',
    );

    await this.saveData(
      repositories.logoSizesRepo,
      this.loadSheetData(filePaths.logoSizesFile).map((row) => ({
        logoPosition: row['Logo Position']?.trim(),
        smallSize: row['Small (inches)']?.trim(),
        mediumSize: row['Medium (inches)']?.trim(),
        largeSize: row['Large (inches)']?.trim(),
        xlSize: row['X-Large (inches)']?.trim(),
      })),
      'Logo Sizes',
    );

    await this.saveData(
      repositories.packagingBagsRepo,
      this.loadSheetData(filePaths.packagingBagsFile).map((row) => ({
        numberOfShirts: row['Number of Shirts'] || null,
        packagingCost: parseInt(row['Packaging Cost (PKR)']) || null,
      })),
      'Packaging Bags',
    );

    await this.saveData(
      repositories.regularCuttingRepo,
      this.loadSheetData(filePaths.regularCuttingFile).map((row) => ({
        quantityOfShirts: row['Quantity of Shirts']?.trim(),
        ratePerShirt: parseFloat(String(row['Rate per Shirt (PKR)'])?.trim()),
        totalCost: row['Total Cost (PKR)']?.trim(),
      })),
      'Regular Cutting',
    );

    await this.saveData(
      repositories.shirtTypesRepo,
      this.loadSheetData(filePaths.shirtTypesFile).map((row) => ({
        shirtType: row['Shirt Type']?.trim(),
      })),
      'Shirt Types',
    );

    await this.saveData(
      repositories.stitchingRepo,
      this.loadSheetData(filePaths.stitchingFile).map((row) => ({
        quantityOfShirts: row['Quantity of Shirts']?.trim(),
        ratePerShirt: parseFloat(String(row['Rate per Shirt (PKR)'])?.trim()),
        totalCost: row['Total Cost (PKR)']?.trim(),
      })),
      'Stitching',
    );

    await this.saveData(
      repositories.sublimationCuttingRepo,
      this.loadSheetData(filePaths.sublimationCuttingFile).map((row) => ({
        quantityOfShirts: row['Quantity of Shirts']?.trim(),
        ratePerShirt: parseFloat(String(row['Rate per Shirt (PKR)'])?.trim()),
        totalCost: row['Total Cost (PKR)']?.trim(),
      })),
      'Sublimation Cutting',
    );

    await this.saveData(
      repositories.bottomHemRepo,
      this.loadSheetData(filePaths.bottomHemFile).map((row) => ({
        printingMethod: row['Printing Method']?.trim(),
        size2_5x2_5: row['2.5 x 2.5 inches (PKR)']?.trim(),
        size3x3: row['3 x 3 inches (PKR)']?.trim(),
        size3_5x3_5: row['3.5 x 3.5 inches (PKR)']?.trim(),
        size4x4: row['4 x 4 inches (PKR)']?.trim(),
      })),
      'Bottom Hem',
    );

    await this.saveData(
      repositories.centerChestRepo,
      this.loadSheetData(filePaths.centerChestFile).map((row) => ({
        printingMethod: row['Printing Method']?.trim(),
        size5x5: row['5 x 5 inches (PKR)']?.trim(),
        size6x6: row['6 x 6 inches (PKR)']?.trim(),
        size7x7: row['7 x 7 inches (PKR)']?.trim(),
        size8x8: row['8 x 8 inches (PKR)']?.trim(),
      })),
      'Center Chest',
    );

    await this.saveData(
      repositories.fullBackRepo,
      this.loadSheetData(filePaths.fullBackFile).map((row) => ({
        printingMethod: row['Printing Method']?.trim(),
        size8x10: row['8 x 10 inches (PKR)']?.trim(),
        size10x12: row['10 x 12 inches (PKR)']?.trim(),
        size12x14: row['12 x 14 inches (PKR)']?.trim(),
        size14x16: row['14 x 16 inches (PKR)']?.trim(),
      })),
      'Full Back',
    );

    await this.saveData(
      repositories.fullFrontRepo,
      this.loadSheetData(filePaths.fullFrontFile).map((row) => ({
        printingMethod: row['Printing Method']?.trim(),
        size8x10: row['8 x 10 inches (PKR)']?.trim(),
        size10x12: row['10 x 12 inches (PKR)']?.trim(),
        size12x14: row['12 x 14 inches (PKR)']?.trim(),
        size14x16: row['14 x 16 inches (PKR)']?.trim(),
      })),
      'Full Front',
    );

    await this.saveData(
      repositories.leftChestRepo,
      this.loadSheetData(filePaths.leftChestFile).map((row) => ({
        printingMethod: row['Printing Method']?.trim(),
        size2_5x2_5: row['2.5 x 2.5 inches (PKR)']?.trim(),
        size3x3: row['3 x 3 inches (PKR)']?.trim(),
        size3_5x3_5: row['3.5 x 3.5 inches (PKR)']?.trim(),
        size4x4: row['4 x 4 inches (PKR)']?.trim(),
      })),
      'Left Chest',
    );

    await this.saveData(
      repositories.oversizedFrontRepo,
      this.loadSheetData(filePaths.oversizedFrontFile).map((row) => ({
        printingMethod: row['Printing Method']?.trim(),
        size10x12: row['10 x 12 inches (PKR)']?.trim(),
        size12x14: row['12 x 14 inches (PKR)']?.trim(),
        size14x16: row['14 x 16 inches (PKR)']?.trim(),
        size16x18: row['16 x 18 inches (PKR)']?.trim(),
      })),
      'Oversized Front',
    );

    await this.saveData(
      repositories.sleevesRepo,
      this.loadSheetData(filePaths.sleevesFile).map((row) => ({
        printingMethod: row['Printing Method']?.trim(),
        size2_5x2_5: row['2.5 x 2.5 inches (PKR)']?.trim(),
        size3x3: row['3 x 3 inches (PKR)']?.trim(),
        size3_5x3_5: row['3.5 x 3.5 inches (PKR)']?.trim(),
        size4x4: row['4 x 4 inches (PKR)']?.trim(),
      })),
      'Sleeves',
    );

    await this.saveData(
      repositories.upperBackRepo,
      this.loadSheetData(filePaths.upperBackFile).map((row) => ({
        printingMethod: row['Printing Method']?.trim(),
        size5x5: row['5 x 5 inches (PKR)']?.trim(),
        size6x6: row['6 x 6 inches (PKR)']?.trim(),
        size7x7: row['7 x 7 inches (PKR)']?.trim(),
        size8x8: row['8 x 8 inches (PKR)']?.trim(),
      })),
      'Upper Back',
    );

    await app.close();
  }


}
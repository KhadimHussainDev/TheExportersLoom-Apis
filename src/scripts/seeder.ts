import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import {
  FabricSizeCalculation,
  FabricPricing,
  PackagingBags,
  LogoSizes,
  ShirtTypes,
  RegularCutting,
  Stitching,
  SublimationCutting,
  BottomHem,
  CenterChest,
  FullBack,
  FullFront,
  LeftChest,
  OversizedFront,
  Sleeves,
  UpperBack,
} from '../entities';
import * as dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env

console.log('JWT_SECRET from dotenv:', process.env.JWT_SECRET);
console.log('Environment Variables:', process.env);

async function populateData() {
  const app = await NestFactory.createApplicationContext(AppModule);
  console.log('Loaded JWT_SECRET:', process.env.JWT_SECRET);


  const repositories = {
    fabricSizeRepo: app.get<Repository<FabricSizeCalculation>>('FabricSizeCalculationRepository'),
    fabricPricingRepo: app.get<Repository<FabricPricing>>('FabricPricingRepository'),
    logoSizesRepo: app.get<Repository<LogoSizes>>('LogoSizesRepository'),
    packagingBagsRepo: app.get<Repository<PackagingBags>>('PackagingBagsRepository'),
    regularCuttingRepo: app.get<Repository<RegularCutting>>('RegularCuttingRepository'),
    shirtTypesRepo: app.get<Repository<ShirtTypes>>('ShirtTypesRepository'),
    stitchingRepo: app.get<Repository<Stitching>>('StitchingRepository'),
    sublimationCuttingRepo: app.get<Repository<SublimationCutting>>('SublimationCuttingRepository'),
    bottomHemRepo: app.get<Repository<BottomHem>>('BottomHemRepository'),
    centerChestRepo: app.get<Repository<CenterChest>>('CenterChestRepository'),
    fullBackRepo: app.get<Repository<FullBack>>('FullBackRepository'),
    fullFrontRepo: app.get<Repository<FullFront>>('FullFrontRepository'),
    leftChestRepo: app.get<Repository<LeftChest>>('LeftChestRepository'),
    oversizedFrontRepo: app.get<Repository<OversizedFront>>('OversizedFrontRepository'),
    sleevesRepo: app.get<Repository<Sleeves>>('SleevesRepository'),
    upperBackRepo: app.get<Repository<UpperBack>>('UpperBackRepository'),
  };

  const filePaths = {
    fabricSizeFile: process.env.FABRIC_SIZE_FILE_PATH || './data/Shirts/Fabric Size Calculation.xlsx',
    fabricPricingFile: process.env.FABRIC_PRICING_FILE_PATH || './data/Shirts/Fabric Pricing.xlsx',
    logoSizesFile: process.env.LOGO_SIZES_FILE_PATH || './data/Shirts/Logo Sizes.xlsx',
    packagingBagsFile: process.env.PACKAGING_BAGS_FILE_PATH || './data/Shirts/Packging Bags.xlsx',
    regularCuttingFile: process.env.REGULAR_CUTTING_FILE_PATH || './data/Shirts/Regular Cutting of Shirts.xlsx',
    shirtTypesFile: process.env.SHIRT_TYPES_FILE_PATH || './data/Shirts/Shirt Types.xlsx',
    stitchingFile: process.env.STITCHING_FILE_PATH || './data/Shirts/Stitching.xlsx',
    sublimationCuttingFile: process.env.SUBLIMATION_CUTTING_FILE_PATH || './data/Shirts/Sublimation Cutting of Shirts.xlsx',
    bottomHemFile: process.env.BOTTOM_HEM_FILE_PATH || './data/Shirts/Logo Pricing/Bottom Hem.xlsx',
    centerChestFile: process.env.CENTER_CHEST_FILE_PATH || './data/Shirts/Logo Pricing/Center Chest.xlsx',
    fullBackFile: process.env.FULL_BACK_FILE_PATH || './data/Shirts/Logo Pricing/Full Back.xlsx',
    fullFrontFile: process.env.FULL_FRONT_FILE_PATH || './data/Shirts/Logo Pricing/Full Front.xlsx',
    leftChestFile: process.env.LEFT_CHEST_FILE_PATH || './data/Shirts/Logo Pricing/Left Chest.xlsx',
    oversizedFrontFile: process.env.OVERSIZED_FRONT_FILE_PATH || './data/Shirts/Logo Pricing/Oversized Front.xlsx',
    sleevesFile: process.env.SLEEVES_FILE_PATH || './data/Shirts/Logo Pricing/Sleeves.xlsx',
    upperBackFile: process.env.UPPER_BACK_FILE_PATH || './data/Shirts/Logo Pricing/Upper Back.xlsx',
  };

  function loadSheetData(filePath: string): any[] {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet);
  }

  async function saveData(repository: Repository<any>, data: any[], entityName: string) {
    try {
      await repository.save(data);
      console.log(`${entityName} data populated successfully.`);
    } catch (error) {
      console.error(`Error saving ${entityName} data:`, error);
    }
  }

  // Data loading and saving for each entity
  await saveData(
    repositories.fabricSizeRepo,
    loadSheetData(filePaths.fabricSizeFile).map(row => ({
      shirtType: row['Shirt Type']?.trim(),
      fabricType: row['Fabric Type']?.trim(),
      smallSize: parseFloat(row['Small (kg)']) || null,
      mediumSize: parseFloat(row['Medium (kg)']) || null,
      largeSize: parseFloat(row['Large (kg)']) || null,
      xlSize: parseFloat(row['XL (kg)'] || row['X-Large (kg)']) || null,
    })),
    'Fabric Size Calculation'
  );

  await saveData(
    repositories.fabricPricingRepo,
    loadSheetData(filePaths.fabricPricingFile).map(row => ({
      category: row['Category']?.trim(),
      subCategory: row['Sub-Category']?.trim(),
      price: row['Price']?.trim(),
      description: row['Description']?.trim(),
    })),
    'Fabric Pricing'
  );

  await saveData(
    repositories.logoSizesRepo,
    loadSheetData(filePaths.logoSizesFile).map(row => ({
      logoPosition: row['Logo Position']?.trim(),
      smallSize: row['Small (inches)']?.trim(),
      mediumSize: row['Medium (inches)']?.trim(),
      largeSize: row['Large (inches)']?.trim(),
      xlSize: row['X-Large (inches)']?.trim(),
    })),
    'Logo Sizes'
  );

  await saveData(
    repositories.packagingBagsRepo,
    loadSheetData(filePaths.packagingBagsFile).map(row => ({
      numberOfShirts: row['Number of Shirts'] || null,
      packagingCost: parseInt(row['Packaging Cost (PKR)']) || null,
    })),
    'Packaging Bags'
  );

  await saveData(
    repositories.regularCuttingRepo,
    loadSheetData(filePaths.regularCuttingFile).map(row => ({
      quantityOfShirts: row['Quantity of Shirts']?.trim(),
      ratePerShirt: parseFloat(String(row['Rate per Shirt (PKR)'])?.trim()),
      totalCost: row['Total Cost (PKR)']?.trim(),
    })),
    'Regular Cutting'
  );

  await saveData(
    repositories.shirtTypesRepo,
    loadSheetData(filePaths.shirtTypesFile).map(row => ({
      shirtType: row['Shirt Type']?.trim(),
    })),
    'Shirt Types'
  );

  await saveData(
    repositories.stitchingRepo,
    loadSheetData(filePaths.stitchingFile).map(row => ({
      quantityOfShirts: row['Quantity of Shirts']?.trim(),
      ratePerShirt: parseFloat(String(row['Rate per Shirt (PKR)'])?.trim()),
      totalCost: row['Total Cost (PKR)']?.trim(),
    })),
    'Stitching'
  );

  await saveData(
    repositories.sublimationCuttingRepo,
    loadSheetData(filePaths.sublimationCuttingFile).map(row => ({
      quantityOfShirts: row['Quantity of Shirts']?.trim(),
      ratePerShirt: parseFloat(String(row['Rate per Shirt (PKR)'])?.trim()),
      totalCost: row['Total Cost (PKR)']?.trim(),
    })),
    'Sublimation Cutting'
  );

  await saveData(
    repositories.bottomHemRepo,
    loadSheetData(filePaths.bottomHemFile).map(row => ({
      printingMethod: row['Printing Method']?.trim(),
      size2_5x2_5: row['2.5 x 2.5 inches (PKR)']?.trim(),
      size3x3: row['3 x 3 inches (PKR)']?.trim(),
      size3_5x3_5: row['3.5 x 3.5 inches (PKR)']?.trim(),
      size4x4: row['4 x 4 inches (PKR)']?.trim(),
    })),
    'Bottom Hem'
  );

  await saveData(
    repositories.centerChestRepo,
    loadSheetData(filePaths.centerChestFile).map(row => ({
      printingMethod: row['Printing Method']?.trim(),
      size5x5: row['5 x 5 inches (PKR)']?.trim(),
      size6x6: row['6 x 6 inches (PKR)']?.trim(),
      size7x7: row['7 x 7 inches (PKR)']?.trim(),
      size8x8: row['8 x 8 inches (PKR)']?.trim(),
    })),
    'Center Chest'
  );

  await saveData(
    repositories.fullBackRepo,
    loadSheetData(filePaths.fullBackFile).map(row => ({
      printingMethod: row['Printing Method']?.trim(),
      size8x10: row['8 x 10 inches (PKR)']?.trim(),
      size10x12: row['10 x 12 inches (PKR)']?.trim(),
      size12x14: row['12 x 14 inches (PKR)']?.trim(),
      size14x16: row['14 x 16 inches (PKR)']?.trim(),
    })),
    'Full Back'
  );

  await saveData(
    repositories.fullFrontRepo,
    loadSheetData(filePaths.fullFrontFile).map(row => ({
      printingMethod: row['Printing Method']?.trim(),
      size8x10: row['8 x 10 inches (PKR)']?.trim(),
      size10x12: row['10 x 12 inches (PKR)']?.trim(),
      size12x14: row['12 x 14 inches (PKR)']?.trim(),
      size14x16: row['14 x 16 inches (PKR)']?.trim(),
    })),
    'Full Front'
  );

  await saveData(
    repositories.leftChestRepo,
    loadSheetData(filePaths.leftChestFile).map(row => ({
      printingMethod: row['Printing Method']?.trim(),
      size2_5x2_5: row['2.5 x 2.5 inches (PKR)']?.trim(),
      size3x3: row['3 x 3 inches (PKR)']?.trim(),
      size3_5x3_5: row['3.5 x 3.5 inches (PKR)']?.trim(),
      size4x4: row['4 x 4 inches (PKR)']?.trim(),
    })),
    'Left Chest'
  );

  await saveData(
    repositories.oversizedFrontRepo,
    loadSheetData(filePaths.oversizedFrontFile).map(row => ({
      printingMethod: row['Printing Method']?.trim(),
      size10x12: row['10 x 12 inches (PKR)']?.trim(),
      size12x14: row['12 x 14 inches (PKR)']?.trim(),
      size14x16: row['14 x 16 inches (PKR)']?.trim(),
      size16x18: row['16 x 18 inches (PKR)']?.trim(),
    })),
    'Oversized Front'
  );

  await saveData(
    repositories.sleevesRepo,
    loadSheetData(filePaths.sleevesFile).map(row => ({
      printingMethod: row['Printing Method']?.trim(),
      size2_5x2_5: row['2.5 x 2.5 inches (PKR)']?.trim(),
      size3x3: row['3 x 3 inches (PKR)']?.trim(),
      size3_5x3_5: row['3.5 x 3.5 inches (PKR)']?.trim(),
      size4x4: row['4 x 4 inches (PKR)']?.trim(),
    })),
    'Sleeves'
  );

  await saveData(
    repositories.upperBackRepo,
    loadSheetData(filePaths.upperBackFile).map(row => ({
      printingMethod: row['Printing Method']?.trim(),
      size5x5: row['5 x 5 inches (PKR)']?.trim(),
      size6x6: row['6 x 6 inches (PKR)']?.trim(),
      size7x7: row['7 x 7 inches (PKR)']?.trim(),
      size8x8: row['8 x 8 inches (PKR)']?.trim(),
    })),
    'Upper Back'
  );

  await app.close();
}

// Execute the seeder script
populateData().catch((error) => {
  console.error('Error populating data:', error);
  process.exit(1);
});

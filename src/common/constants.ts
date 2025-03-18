/**
 * Application-wide constants
 */

// Project constants
export const MAX_TOTAL_COST = 9999999999999.99;

// Module titles
export const MODULE_TITLES = {
  FABRIC_PRICING: 'Fabric Pricing Module Bid',
  LOGO_PRINTING: 'Logo Printing Module Bid',
  STITCHING: 'Stitching Module Bid',
  PACKAGING: 'Packaging Module Bid',
  CUTTING: 'Cutting Module Bid',
  FABRIC_QUANTITY: 'Fabric Quantity Module'
};

// Module types to machine types mapping
export const MODULE_TO_MACHINE_MAP = {
  CuttingModule: 'Cutting',
  StitchingModule: 'Stitching',
  LogoPrintingModule: 'Logo Printing',
  FabricPricingModule: 'Fabric Pricing',
  PackagingModule: 'Packaging',
};

// Size mappings
export const SIZE_MAPPINGS = {
  's': 'smallSize', 'small': 'smallSize',
  'm': 'mediumSize', 'medium': 'mediumSize',
  'l': 'largeSize', 'large': 'largeSize',
  'xl': 'xlSize', 'extra large': 'xlSize', 'extralarge': 'xlSize'
};

// Default descriptions
export const DEFAULT_DESCRIPTIONS = {
  EMPTY: ''
};



// Verification constants
export const VERIFICATION = {
  CODE_MIN: 100000,
  CODE_MAX: 999999,
  EXPIRY_HOURS: 24
};

// Status constants
export const STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  POSTED: 'Posted',
  DRAFT: 'Draft',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  ACCEPTED: 'Accepted'
};

// Module types
export const MODULE_TYPES = {
  CUTTING: 'CuttingModule',
  STITCHING: 'StitchingModule',
  LOGO_PRINTING: 'LogoPrintingModule',
  FABRIC_PRICING: 'FabricPricingModule',
  PACKAGING: 'PackagingModule',
  FABRIC_QUANTITY: 'FabricQuantity'
}; 

// User Roles
export const ROLES = {
  MANUFACTURER: 'Manufacturer',
  EXPORTER: 'Exporter'
};
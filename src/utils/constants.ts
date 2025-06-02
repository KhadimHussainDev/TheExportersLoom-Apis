export const STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELED: 'canceled'
};

// Mapping between module types and machine types
export const MODULE_TO_MACHINE_MAP = {
  // Cutting module requires cutting machine
  'cutting': 'cutting',
  // Stitching module requires stitching machine
  'stitching': 'stitching',
  // Packaging module requires packaging machine
  'packaging': 'packaging',
  // Logo printing module requires printing machine
  'logo-printing': 'printing',
  'printing': 'printing',
  // Default fallback - use the same name
  'default': null
}; 
import { Sale, Purchase } from '../types';

export interface PharmacyConfig {
  // Pharmacy Details
  pharmacyName: string;
  address: string;
  contactNumber: string;
  email: string;
  pan: string;
  drugLicenseNumber: string;
  gstNumber: string;
  fssaiLicense: string;
  
  // Billing Metadata
  billNumberPrefix: string;
  softwareUsed: string;
  generatedBy: string;
  logoUrl: string;
  
  // Additional Settings
  timezone: string;
  currency: string;
  taxRate: number;
  
  // Print Settings
  printFormat: 'A4' | 'A5' | 'thermal';
  showLogo: boolean;
  showQRCode: boolean;
  footerText: string;
}

export const getPharmacyConfig = (): PharmacyConfig => {
  const savedConfig = localStorage.getItem('pharmacyConfig');
  
  if (savedConfig) {
    return JSON.parse(savedConfig);
  }
  
  // Default configuration
  return {
    pharmacyName: 'Drug Bee Medical & General Store',
    address: '#56, 2nd Floor, 12th Main Road, Sector 6, HSR Layout, Bengaluru, Karnataka - 560102',
    contactNumber: '+91-9035638000',
    email: 'info@pharmacare.com',
    pan: 'AASFD1081C',
    drugLicenseNumber: 'KA/GLB/20B/426/21B/415',
    gstNumber: '29ABYPB7940B1ZF',
    fssaiLicense: 'RR/20B/MP/4792',
    billNumberPrefix: 'DB',
    softwareUsed: 'Drug Bee Management System',
    generatedBy: 'Dimple Kumar',
    logoUrl: '',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    taxRate: 12,
    printFormat: 'A4',
    showLogo: true,
    showQRCode: true,
    footerText: 'Thank you for choosing PharmaCare!'
  };
};

export const savePharmacyConfig = (config: PharmacyConfig): void => {
  localStorage.setItem('pharmacyConfig', JSON.stringify(config));
};

export const generateBillNumber = (): string => {
  const config = getPharmacyConfig();
  const lastBillNumber = localStorage.getItem('lastBillNumber') || '0';
  const nextNumber = parseInt(lastBillNumber) + 1;
  const paddedNumber = nextNumber.toString().padStart(6, '0');
  
  localStorage.setItem('lastBillNumber', nextNumber.toString());
  
  return `${config.billNumberPrefix}${paddedNumber}`;
};

export const applyPharmacyConfigToSale = (sale: Partial<Sale>): Sale => {
  const config = getPharmacyConfig();
  
  return {
    ...sale,
    billNumber: sale.billNumber || generateBillNumber(),
    gstNumber: config.gstNumber,
    // Add other pharmacy details as needed
  } as Sale;
};

export const applyPharmacyConfigToPurchase = (purchase: Partial<Purchase>): Purchase => {
  const config = getPharmacyConfig();
  
  return {
    ...purchase,
    // Add pharmacy details to purchase if needed
  } as Purchase;
};

export const getFormattedPharmacyAddress = (): string => {
  const config = getPharmacyConfig();
  return config.address;
};

export const getFormattedPharmacyContact = (): string => {
  const config = getPharmacyConfig();
  return `${config.contactNumber} | ${config.email}`;
};

export const getCurrencySymbol = (): string => {
  const config = getPharmacyConfig();
  
  switch (config.currency) {
    case 'INR':
      return '₹';
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    default:
      return '₹';
  }
};

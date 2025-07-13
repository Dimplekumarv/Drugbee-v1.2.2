import { PurchaseItem } from '../types';

export const parseCSVFile = async (file: File): Promise<PurchaseItem[]> => {
  // Implement CSV parsing logic here
  throw new Error('CSV parsing not implemented');
};

export const processPDFInvoice = async (file: File): Promise<{
  vendorName: string;
  invoiceNumber: string;
  invoiceDate: string;
  items: PurchaseItem[];
}> => {
  // Implement PDF processing logic here
  throw new Error('PDF processing not implemented');
};

export const processOCRImage = async (file: File): Promise<{
  vendorName: string;
  invoiceNumber: string;
  invoiceDate: string;
  items: PurchaseItem[];
}> => {
  // Implement OCR processing logic here
  throw new Error('OCR processing not implemented');
};

import { findProductByNameAndBatch } from './inventory';
import { mockProducts } from '../data/mockData';

export const processOCRImage = async (file: File): Promise<any> => {
  // Simulate OCR processing with enhanced product matching and column mapping
  return new Promise((resolve) => {
    setTimeout(() => {
      const extractedItems = [
        {
          productName: 'THYROXORM 12.5MG TAB',
          hsnCode: '3004',
          batch: 'THY001',
          expiryDate: '2025-12-31',
          packUnits: '1x10',
          quantity: 30,
          rate: 10.00,
          mrp: 12.50,
          cgst: 6,
          sgst: 6,
          discount: 4.00,
          total: 300.00
        },
        {
          productName: 'PARACETAMOL 500MG TAB',
          hsnCode: '3004',
          batch: 'PAR002',
          expiryDate: '2025-08-15',
          packUnits: '1x10',
          quantity: 50,
          rate: 8.50,
          mrp: 10.00,
          cgst: 6,
          sgst: 6,
          discount: 2.00,
          total: 425.00
        }
      ];

      // Try to match with existing products
      const matchedItems = extractedItems.map(item => {
        const existingProduct = findProductByNameAndBatch(mockProducts, item.productName, item.batch);
        if (existingProduct) {
          return {
            ...item,
            productId: existingProduct.id,
            productName: existingProduct.name,
            hsnCode: existingProduct.hsnCode,
            packUnits: existingProduct.packUnits
          };
        }
        return item;
      });

      resolve({
        vendorName: 'Grantrail Wholesale Pvt Ltd',
        invoiceNumber: `GTW9FK/${Date.now()}`,
        invoiceDate: new Date().toISOString().split('T')[0],
        items: matchedItems,
        subtotal: matchedItems.reduce((sum: number, item: any) => sum + (item.quantity * item.rate), 0),
        tax: matchedItems.reduce((sum: number, item: any) => sum + (item.quantity * item.rate * (item.cgst + item.sgst) / 100), 0),
        total: matchedItems.reduce((sum: number, item: any) => sum + item.total, 0),
        gstNumber: '24AQPPA1376R1ZM',
        vendorAddress: 'Ahmedabad'
      });
    }, 2000);
  });
};

export const processPDFInvoice = async (file: File): Promise<any> => {
  // Simulate PDF processing with enhanced column mapping
  return new Promise((resolve) => {
    setTimeout(() => {
      const extractedItems = [
        {
          productName: 'MODGLIP AS6 75MG TAB',
          hsnCode: '3004',
          batch: 'MOD002',
          expiryDate: '2025-10-15',
          packUnits: '1x10',
          quantity: 3,
          rate: 24.36,
          mrp: 28.50,
          cgst: 6,
          sgst: 6,
          discount: 4.00,
          total: 73.08
        },
        {
          productName: 'AZITHROMYCIN 250MG TAB',
          hsnCode: '3004',
          batch: 'AZI003',
          expiryDate: '2025-06-20',
          packUnits: '1x6',
          quantity: 10,
          rate: 45.00,
          mrp: 52.00,
          cgst: 6,
          sgst: 6,
          discount: 3.00,
          total: 450.00
        }
      ];

      const matchedItems = extractedItems.map(item => {
        const existingProduct = findProductByNameAndBatch(mockProducts, item.productName, item.batch);
        if (existingProduct) {
          return {
            ...item,
            productId: existingProduct.id,
            productName: existingProduct.name,
            hsnCode: existingProduct.hsnCode,
            packUnits: existingProduct.packUnits
          };
        }
        return item;
      });

      resolve({
        vendorName: 'Dhruvi Pharma Pvt Ltd',
        invoiceNumber: `DPL-${Date.now()}`,
        invoiceDate: new Date().toISOString().split('T')[0],
        items: matchedItems,
        subtotal: matchedItems.reduce((sum: number, item: any) => sum + (item.quantity * item.rate), 0),
        tax: matchedItems.reduce((sum: number, item: any) => sum + (item.quantity * item.rate * (item.cgst + item.sgst) / 100), 0),
        total: matchedItems.reduce((sum: number, item: any) => sum + item.total, 0),
        gstNumber: '24AQPPA1376R1ZM',
        vendorAddress: 'Ahmedabad'
      });
    }, 1500);
  });
};

export const parseCSVFile = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const items = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const item: any = {};
          
          // Map CSV columns to purchase entry fields
          headers.forEach((header, index) => {
            const value = values[index];
            switch (header.toLowerCase()) {
              case 'product':
              case 'product name':
              case 'productname':
                item.productName = value;
                break;
              case 'hsn':
              case 'hsn code':
              case 'hsncode':
                item.hsnCode = value;
                break;
              case 'batch':
              case 'batch no':
              case 'batchno':
                item.batch = value;
                break;
              case 'expiry':
              case 'expiry date':
              case 'expirydate':
                item.expiryDate = value;
                break;
              case 'pack':
              case 'pack units':
              case 'packunits':
                item.packUnits = value;
                break;
              case 'qty':
              case 'quantity':
                item.quantity = parseInt(value) || 0;
                break;
              case 'rate':
              case 'price':
                item.rate = parseFloat(value) || 0;
                break;
              case 'mrp':
                item.mrp = parseFloat(value) || 0;
                break;
              case 'cgst':
                item.cgst = parseFloat(value) || 6;
                break;
              case 'sgst':
                item.sgst = parseFloat(value) || 6;
                break;
              case 'discount':
                item.discount = parseFloat(value) || 0;
                break;
              case 'total':
              case 'amount':
                item.total = parseFloat(value) || 0;
                break;
              default:
                item[header] = value;
            }
          });
          
          // Calculate total if not provided
          if (!item.total && item.quantity && item.rate) {
            const baseAmount = item.quantity * item.rate;
            const discountAmount = baseAmount * (item.discount / 100);
            const taxableAmount = baseAmount - discountAmount;
            const gstAmount = taxableAmount * ((item.cgst + item.sgst) / 100);
            item.total = taxableAmount + gstAmount;
          }
          
          // Try to match with existing products
          const existingProduct = findProductByNameAndBatch(mockProducts, item.productName, item.batch);
          if (existingProduct) {
            item.productId = existingProduct.id;
            item.hsnCode = item.hsnCode || existingProduct.hsnCode;
            item.packUnits = item.packUnits || existingProduct.packUnits;
          }
          
          return item;
        }).filter(item => item.productName);

        resolve(items);
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsText(file);
  });
};

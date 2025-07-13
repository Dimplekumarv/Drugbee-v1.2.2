import jsPDF from 'jspdf';
import { Sale } from '../types';
import { format } from 'date-fns';

export const generateBillPDF = (sale: Sale, pdfFormat: 'A4' | 'A5' = 'A4'): void => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: pdfFormat === 'A4' ? 'a4' : 'a5'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  let yPos = margin;

  // Header - Company Info
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PharmaCare Medical & General Store', pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Address: #56, 2nd Floor, 12th Main Road, Sector 6', pageWidth / 2, yPos, { align: 'center' });
  yPos += 4;
  pdf.text('Contact: 08472-27537, 9035638000, 9035648000', pageWidth / 2, yPos, { align: 'center' });
  yPos += 4;
  pdf.text('Email: info@pharmacare.com', pageWidth / 2, yPos, { align: 'center' });
  yPos += 4;
  pdf.text('Drug License: KA/GLB/20B/426/21B/415', pageWidth / 2, yPos, { align: 'center' });
  yPos += 4;
  pdf.text(`GSTIN: ${sale.gstNumber || '29ABYPB7940B1ZF'} - Composition Dealer`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;

  // Tax Invoice Header
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('TAX INVOICE', margin, yPos);
  
  // Invoice Details - Right Side
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Invoice Number: ${sale.billNumber}`, pageWidth - 60, yPos);
  yPos += 5;
  pdf.text(`Invoice Date: ${format(sale.createdAt, 'dd/MM/yyyy')}`, pageWidth - 60, yPos);
  yPos += 5;
  pdf.text(`Due Date: ${format(new Date(sale.createdAt.getTime() + 10 * 24 * 60 * 60 * 1000), 'dd/MM/yyyy')}`, pageWidth - 60, yPos);
  yPos += 8;

  // Billing To Section
  pdf.setFont('helvetica', 'bold');
  pdf.text('BILLING TO', margin, yPos);
  yPos += 5;

  pdf.setFont('helvetica', 'normal');
  pdf.text(`Customer: ${sale.customerName} (${sale.customerPhone})`, margin, yPos);
  yPos += 4;
  if (sale.customerAddress) {
    pdf.text(`Address: ${sale.customerAddress}`, margin, yPos);
    yPos += 4;
  }
  if (sale.doctorName) {
    pdf.text(`Doctor: ${sale.doctorName}`, margin, yPos);
    yPos += 4;
  }

  // Right side - Additional Info
  pdf.text(`GSTIN: 27AUHPA4739P1ZM`, pageWidth - 60, yPos - 12);
  pdf.text(`Place of Supply: Karnataka (29)`, pageWidth - 60, yPos - 8);
  yPos += 8;

  // Table Header
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 3;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.text('Sn', margin + 2, yPos);
  pdf.text('PRODUCT', margin + 10, yPos);
  pdf.text('HSN', margin + 60, yPos);
  pdf.text('BATCH', margin + 75, yPos);
  pdf.text('PACK', margin + 95, yPos);
  pdf.text('EXPIRY', margin + 110, yPos);
  pdf.text('QTY', margin + 125, yPos);
  pdf.text('MRP', margin + 135, yPos);
  pdf.text('RATE', margin + 145, yPos);
  pdf.text('DISC', margin + 155, yPos);
  pdf.text('CGST', margin + 165, yPos);
  pdf.text('SGST', margin + 175, yPos);
  pdf.text('AMOUNT', margin + 185, yPos);
  yPos += 3;

  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;

  // Items
  pdf.setFont('helvetica', 'normal');
  sale.items.forEach((item, index) => {
    pdf.text((index + 1).toString(), margin + 2, yPos);
    pdf.text(item.productName.substring(0, 20), margin + 10, yPos);
    pdf.text(item.hsnCode, margin + 60, yPos);
    pdf.text(item.batch, margin + 75, yPos);
    pdf.text(item.packUnits, margin + 95, yPos);
    pdf.text(format(item.expiryDate, 'MM/yy'), margin + 110, yPos);
    pdf.text(item.quantity.toString(), margin + 125, yPos);
    pdf.text(`₹${item.price.toFixed(2)}`, margin + 135, yPos);
    pdf.text(`₹${item.price.toFixed(2)}`, margin + 145, yPos);
    pdf.text('0.00%', margin + 155, yPos);
    pdf.text(`${item.cgst}%`, margin + 165, yPos);
    pdf.text(`${item.sgst}%`, margin + 175, yPos);
    pdf.text(`₹${item.total.toFixed(2)}`, margin + 185, yPos);
    yPos += 5;
  });

  yPos += 3;
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;

  // Totals Section
  pdf.text(`TOTAL PRODUCTS: ${sale.items.length}`, margin, yPos);
  pdf.text(`${sale.items.reduce((sum, item) => sum + item.quantity, 0)}`, margin + 125, yPos);
  pdf.text('Sub Total', margin + 155, yPos);
  pdf.text(`₹${sale.subtotal.toFixed(2)}`, margin + 185, yPos);
  yPos += 5;

  // Tax Breakdown
  const cgstAmount = sale.tax / 2;
  const sgstAmount = sale.tax / 2;

  pdf.text('Less: Bill Discount', margin + 155, yPos);
  pdf.text(`₹${sale.discount.toFixed(2)}`, margin + 185, yPos);
  yPos += 4;

  pdf.text('GST Amount', margin + 155, yPos);
  pdf.text(`(₹${sale.tax.toFixed(2)})`, margin + 185, yPos);
  yPos += 8;

  // Final Total
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('Total Payable', margin + 155, yPos);
  pdf.text(`₹${sale.total.toFixed(2)}`, margin + 185, yPos);
  yPos += 8;

  // Terms and Conditions
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text('Terms & Conditions', margin, yPos);
  yPos += 4;
  pdf.text('1. Goods once sold shall not be taken back.', margin, yPos);
  yPos += 3;
  pdf.text('2. All the disputes are subject to local jurisdiction', margin, yPos);
  yPos += 8;

  // Footer
  pdf.text(`Generated by PharmaCare at ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`, margin, pageHeight - 15);
  pdf.text('Powered by PharmaCare (pharmacare.com)', pageWidth - 80, pageHeight - 15);

  // Save PDF
  pdf.save(`${sale.billNumber}-${pdfFormat}.pdf`);
};

export const generatePurchaseReport = (purchases: any[], pdfFormat: 'A4' | 'A5' = 'A4'): void => {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: pdfFormat === 'A4' ? 'a4' : 'a5'
  });

  pdf.text('Purchase Report', 20, 20);
  pdf.save(`purchase-report-${pdfFormat}.pdf`);
};

export const generateSalesReport = (sales: Sale[], pdfFormat: 'A4' | 'A5' = 'A4'): void => {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: pdfFormat === 'A4' ? 'a4' : 'a5'
  });

  pdf.text('Sales Report', 20, 20);
  pdf.save(`sales-report-${pdfFormat}.pdf`);
};

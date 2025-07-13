import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  X,
  MessageCircle
} from 'lucide-react';
import { Sale } from '../../types';
import { generateBillPDF } from '../../utils/pdf';
import toast from 'react-hot-toast';

interface BillPreviewProps {
  sale: Sale;
  onClose: () => void;
  onBack: () => void;
}

const BillPreview: React.FC<BillPreviewProps> = ({ sale, onClose, onBack }) => {
  const [selectedFormat, setSelectedFormat] = useState<'A4' | 'A5'>('A4');

  const handlePrint = () => {
    generateBillPDF(sale, selectedFormat);
    toast.success(`Bill printed in ${selectedFormat} format`);
  };

  const handleDownload = () => {
    generateBillPDF(sale, selectedFormat);
    toast.success(`Bill downloaded in ${selectedFormat} format`);
  };

  const handleSendWhatsApp = () => {
    const message = `Hi ${sale.customerName}, your bill ${sale.billNumber} for ₹${sale.total.toFixed(2)} is ready. Thank you for shopping with PharmaCare!`;
    const whatsappUrl = `https://wa.me/${sale.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    toast.success('WhatsApp message opened');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Add New Sale
            </button>
            <span className="text-gray-400">›</span>
            <span className="text-gray-900 font-medium">Sale # {sale.billNumber}</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
            <button
              onClick={onClose}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 pb-32">
        <div className="max-w-4xl mx-auto">
          {/* Bill Preview */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Invoice Header */}
            <div className="bg-white p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="text-sm text-gray-600 mb-2">TAX INVOICE</div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-600 rounded flex items-center justify-center">
                      <span className="text-white font-bold text-lg">A</span>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900">Akanksha Medical & General Store</h1>
                      <div className="text-sm text-gray-600 mt-1">
                        <div>Address: #56, 2nd Floor, 12th Main Road, Sector 6</div>
                        <div>HSR Layout, Bengaluru, Karnataka - 560102</div>
                        <div>Contact: 08472-270372, 9035638000, 9035648000</div>
                        <div>Email: mahalaxmi_gls@rediffmail.com</div>
                        <div>Drug License: KA/GLB/20B/426/21B/415</div>
                        <div>GSTIN: 29ABYPB7940B1ZF - Composition Dealer</div>
                        <div>FSSAI License: RR/20B/MP/4792</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <div className="text-gray-600">Invoice Number</div>
                    <div className="font-medium">{sale.billNumber}</div>
                    <div className="text-gray-600">Invoice Date</div>
                    <div className="font-medium">{sale.createdAt.toLocaleDateString('en-GB')}</div>
                    <div className="text-gray-600">Due Date</div>
                    <div className="font-medium">{new Date(sale.createdAt.getTime() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}</div>
                  </div>
                  
                  <div className="mt-4 p-3 border border-gray-200 rounded">
                    <div className="text-xs text-gray-600 mb-1">To view or download in pdf or csv format</div>
                    <div className="w-16 h-16 bg-gray-200 rounded mx-auto mb-1"></div>
                    <div className="text-xs text-gray-600">Scan this QR code</div>
                  </div>
                </div>
              </div>

              {/* Billing Information */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">BILLING TO</h3>
                  <div className="text-sm space-y-1">
                    <div><span className="text-gray-600">Customer:</span> {sale.customerName} (MALE | 27 YRS)</div>
                    <div><span className="text-gray-600">Contact:</span> {sale.customerPhone}</div>
                    {sale.doctorName && <div><span className="text-gray-600">Doctor:</span> {sale.doctorName}</div>}
                    {sale.customerAddress && <div><span className="text-gray-600">Address:</span> {sale.customerAddress}</div>}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm space-y-1">
                    <div><span className="text-gray-600">GSTIN:</span> 27AUHPA4739P1ZM</div>
                    <div><span className="text-gray-600">Place of Supply:</span> Andhra Pradesh (27)</div>
                    <div><span className="text-gray-600">Credit Balance:</span> (₹ 14402.30)</div>
                    <div className="text-xs text-gray-500 mt-2">Tax not payable on reverse charge basis</div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-2 px-1">Sn</th>
                      <th className="text-left py-2 px-1">PRODUCT</th>
                      <th className="text-left py-2 px-1">HSN</th>
                      <th className="text-left py-2 px-1">BATCH</th>
                      <th className="text-left py-2 px-1">PACK</th>
                      <th className="text-left py-2 px-1">EXPIRY</th>
                      <th className="text-left py-2 px-1">MRP</th>
                      <th className="text-left py-2 px-1">SALE QTY</th>
                      <th className="text-left py-2 px-1">RATE</th>
                      <th className="text-left py-2 px-1">DISC.</th>
                      <th className="text-left py-2 px-1">GST</th>
                      <th className="text-left py-2 px-1">AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sale.items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-2 px-1">{index + 1}.</td>
                        <td className="py-2 px-1 font-medium">{item.productName}</td>
                        <td className="py-2 px-1">{item.hsnCode}</td>
                        <td className="py-2 px-1">{item.batch}</td>
                        <td className="py-2 px-1">{item.packUnits}</td>
                        <td className="py-2 px-1">{item.expiryDate.toLocaleDateString('en-GB', { month: '2-digit', year: '2-digit' })}</td>
                        <td className="py-2 px-1">₹{item.price.toFixed(2)}</td>
                        <td className="py-2 px-1">{item.quantity} packs | {item.quantity} units</td>
                        <td className="py-2 px-1">₹{item.price.toFixed(2)}</td>
                        <td className="py-2 px-1">{item.discount.toFixed(2)}%</td>
                        <td className="py-2 px-1">{(item.cgst + item.sgst)}%</td>
                        <td className="py-2 px-1 font-medium">₹{item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Section */}
              <div className="border-t border-gray-300 pt-4">
                <div className="flex justify-between items-start">
                  <div className="w-1/2">
                    <div className="text-sm font-medium mb-2">TOTAL PRODUCTS: {sale.items.length}</div>
                    <div className="text-sm mb-4">{sale.items.reduce((sum, item) => sum + item.quantity, 0)} packs | {sale.items.reduce((sum, item) => sum + item.quantity, 0)} units</div>
                    
                    <div className="space-y-2 text-xs">
                      <h4 className="font-semibold">Terms & Conditions</h4>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="font-medium">GST</div>
                          <div>0%</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">5%</div>
                          <div>12%</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">18%</div>
                          <div>28%</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">For Akanksha Medical & General Store</div>
                        </div>
                      </div>
                      
                      <div className="space-y-1 mt-4">
                        <div>1. Goods once sold shall not be taken back. 2. All</div>
                        <div>the disputes are subject to Ahmedabad's partial</div>
                        <div>jurisdiction Payment</div>
                        <div className="mt-2">
                          <div>Taxable: -0.00</div>
                          <div>CGST Amt: -0.00</div>
                          <div>SGST Amt: -0.00</div>
                          <div>IGST Amt: -0.00</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-1/2 text-right">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Sub Total</span>
                        <span>₹{sale.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Less: Bill Discount</span>
                        <span>₹{sale.discount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GST Amount</span>
                        <span>(₹{sale.tax.toFixed(2)})</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total Payable</span>
                        <span>₹{sale.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Balance Due</span>
                        <span>₹{sale.total.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      <div className="text-sm font-medium mb-2">Authorized Signatory</div>
                      <div className="h-12 border-b border-gray-300"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500">
                <div className="flex justify-between">
                  <div>ORIGINAL / DUPLICATE / TRIPLICATE</div>
                  <div>Generated by Shalil Ahmed at {sale.createdAt.toLocaleDateString('en-GB')} {sale.createdAt.toLocaleTimeString()}</div>
                  <div>Powered by localwelt (localwelt.in)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-8">
            <div className="text-center">
              <div className="text-sm opacity-90">Total Products:</div>
              <div className="font-bold text-lg">{sale.items.length}</div>
            </div>
            <div className="text-center">
              <div className="text-sm opacity-90">Total Quantity:</div>
              <div className="font-bold text-lg">{sale.items.reduce((sum, item) => sum + item.quantity, 0)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm opacity-90">(-) GST Amount</div>
              <div className="font-bold text-lg">₹ {sale.tax.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-sm opacity-90">Total Amount</div>
              <div className="font-bold text-lg">₹ {sale.total.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-sm opacity-90">Net Profit</div>
              <div className="font-bold text-lg">₹ {(sale.total * 0.2).toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-sm opacity-90">Amount Paid</div>
              <div className="font-bold text-lg">₹ {sale.total.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-sm opacity-90">Balance Due</div>
              <div className="font-bold text-lg">₹ 0</div>
            </div>
          </div>
          
          <button
            onClick={handleSendWhatsApp}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Send on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillPreview;

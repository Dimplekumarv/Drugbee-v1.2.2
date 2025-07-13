import React from 'react';
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  Edit, 
  Trash2, 
  Building2, 
  Calendar, 
  FileText, 
  Package, 
  Phone,
  MapPin,
  Hash
} from 'lucide-react';
import { Purchase } from '../../types';
import { format } from 'date-fns';

interface PurchaseDetailViewProps {
  purchase: Purchase;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const PurchaseDetailView: React.FC<PurchaseDetailViewProps> = ({
  purchase,
  onBack,
  onEdit,
  onDelete
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate PDF download
    console.log('Downloading purchase bill...');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Purchases
            </button>
            <span className="text-gray-400">›</span>
            <span className="text-gray-900 font-medium">Purchase # {purchase.invoiceNumber}</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
            <button
              onClick={onEdit}
              className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button
              onClick={onDelete}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Purchase Details */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Purchase Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">Purchase Invoice</h1>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="opacity-90">Invoice Number:</span>
                    <div className="font-semibold">{purchase.invoiceNumber}</div>
                  </div>
                  <div>
                    <span className="opacity-90">Invoice Date:</span>
                    <div className="font-semibold">{format(purchase.invoiceDate, 'dd/MM/yyyy')}</div>
                  </div>
                  <div>
                    <span className="opacity-90">Payment Status:</span>
                    <div className="font-semibold capitalize">{purchase.paymentStatus}</div>
                  </div>
                  <div>
                    <span className="opacity-90">Upload Method:</span>
                    <div className="font-semibold capitalize">{purchase.uploadMethod}</div>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm opacity-90">Total Amount</div>
                <div className="text-3xl font-bold">₹{purchase.total != null ? purchase.total.toLocaleString() : '0'}</div>
                <div className="text-sm opacity-90 mt-1">
                  {purchase.paymentStatus === 'paid' ? 'Fully Paid' : 'Outstanding'}
                </div>
              </div>
            </div>
          </div>

          {/* Vendor Information */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Vendor Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vendor Name</label>
                  <p className="text-gray-900 font-medium">{purchase.vendorName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact</label>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-900">{purchase.vendorContact}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                    <p className="text-gray-900">{purchase.vendorAddress}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">GST Number</label>
                  <div className="flex items-center space-x-2">
                    <Hash className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-900">{purchase.gstNumber}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created Date</label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-900">{format(purchase.createdAt, 'dd/MM/yyyy HH:mm')}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Documents</label>
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-900">{purchase.documents.length} files attached</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Purchase Items
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      HSN Code
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expiry
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pack
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rate
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      GST
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {purchase.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{item.productName}</div>
                          <div className="text-sm text-gray-500">MRP: ₹{item.mrp}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">{item.hsnCode}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{item.batch}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {format(item.expiryDate, 'MM/yy')}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">{item.packUnits}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{item.quantity}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">₹{item.rate.toFixed(2)}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{item.cgst + item.sgst}%</td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">₹{item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-6">
            <div className="flex justify-end">
              <div className="w-80">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₹{purchase.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (GST):</span>
                    <span className="font-medium">₹{purchase.tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount:</span>
                      <span>₹{purchase.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseDetailView;

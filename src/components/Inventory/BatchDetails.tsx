import React, { useState, useEffect } from 'react';
import { 
  X, 
  Package, 
  Calendar, 
  FileText, 
  Building2, 
  Phone, 
  MapPin,
  Receipt,
  Truck,
  DollarSign
} from 'lucide-react';
import { Product } from '../../types';
import { supabase } from '../../lib/supabaseClient';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface BatchDetailsProps {
  product: Product;
  batch: string;
  onClose: () => void;
}

const BatchDetails: React.FC<BatchDetailsProps> = ({ product, batch, onClose }) => {
  const [batchPurchases, setBatchPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBatchData = async () => {
      try {
        setLoading(true);
        
        // Fetch purchase items for this batch
        const { data: purchaseItems, error: itemsError } = await supabase
          .from('purchase_items')
          .select(`
            *,
            purchases!inner(
              id,
              vendor_name,
              invoice_number,
              invoice_date,
              payment_status,
              payment_type
            )
          `)
          .eq('product_name', product.name)
          .eq('batch', batch)
          .order('purchase_date', { ascending: false });

        if (itemsError && itemsError.code !== '42P01') {
          throw itemsError;
        }

        if (purchaseItems) {
          setBatchPurchases(purchaseItems);
        } else {
          setBatchPurchases([]);
        }
      } catch (error) {
        console.error('Error fetching batch data:', error);
        toast.error('Failed to load batch details');
        setBatchPurchases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBatchData();
  }, [product.name, batch]);

  const batchPurchase = batchPurchases[0]; // Get the first (most recent) purchase for this batch

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Batch Details</h2>
                <p className="text-gray-600">{product.name}</p>
                <p className="text-sm text-gray-500">Batch: {batch}</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Batch Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Batch Details */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Batch Information</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                    <p className="text-gray-900 font-medium">{batch}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <p className="text-gray-900">{format(product.expiryDate, 'dd/MM/yyyy')}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
                    <p className="text-2xl font-bold text-gray-900">{product.stock}</p>
                    <p className="text-sm text-gray-500">units available</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Value</label>
                    <p className="text-2xl font-bold text-green-600">₹{(product.stock * product.price).toLocaleString()}</p>
                    <p className="text-sm text-gray-500">at current price</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">MRP</label>
                    <p className="text-gray-900">₹{product.mrp.toFixed(2)}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price</label>
                    <p className="text-gray-900">₹{product.price.toFixed(2)}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pack Units</label>
                  <p className="text-gray-900">{product.packUnits}</p>
                </div>
              </div>
            </div>

            {/* Purchase Information */}
            {loading ? (
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ) : batchPurchase ? (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      <p className="text-gray-900 font-medium">{batchPurchase.vendor_name || batchPurchase.purchases?.vendor_name}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                      <div className="flex items-center space-x-2">
                        <Receipt className="w-4 h-4 text-gray-500" />
                        <p className="text-gray-900">{batchPurchase.invoice_number}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <p className="text-gray-900">{format(new Date(batchPurchase.purchase_date), 'dd/MM/yyyy')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Rate</label>
                      <p className="text-gray-900">₹{(batchPurchase.rate || 0).toFixed(2)}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Purchased</label>
                      <p className="text-gray-900">{batchPurchase.quantity || 0} units</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Purchase Value</label>
                    <p className="text-2xl font-bold text-blue-600">₹{(batchPurchase.total || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Information</h3>
                <p className="text-gray-500">No purchase data found for this batch.</p>
              </div>
            )}
          </div>

          {/* Purchase History Table */}
          {batchPurchases.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Purchase History for this Batch</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vendor
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rate
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center">
                          <div className="animate-pulse">
                            <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
                          </div>
                        </td>
                      </tr>
                    ) : batchPurchases.map((purchaseItem) => (
                      <tr key={purchaseItem.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{purchaseItem.invoice_number}</div>
                            <div className="text-sm text-gray-500">Purchase ID: {purchaseItem.purchase_id}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{purchaseItem.vendor_name}</div>
                            <div className="text-sm text-gray-500">
                              {purchaseItem.purchases?.payment_status || 'Unknown'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {purchaseItem.quantity} units
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{(purchaseItem.rate || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{(purchaseItem.total || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(purchaseItem.purchase_date), 'dd/MM/yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 flex items-center space-x-1">
                            <FileText className="w-4 h-4" />
                            <span>View Bill</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Vendor Contact Information */}
          {batchPurchase && (
            <div className="mt-6 bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendor Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Vendor Name</p>
                    <p className="font-medium text-gray-900">{batchPurchase.vendorName}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Contact</p>
                    <p className="font-medium text-gray-900">{batchPurchase.vendorContact}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium text-gray-900">{batchPurchase.vendorAddress}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-4">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Truck className="w-4 h-4" />
              <span>Reorder from Vendor</span>
            </button>
            <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span>Add to Sale</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchDetails;

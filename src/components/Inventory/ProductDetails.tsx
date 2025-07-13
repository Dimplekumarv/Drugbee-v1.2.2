import React, { useState } from 'react';
import { 
  X, 
  Package, 
  Calendar, 
  DollarSign, 
  BarChart3, 
  Edit, 
  Save, 
  AlertTriangle,
  CheckCircle,
  FileText,
  Truck,
  ShoppingCart,
  TrendingUp
} from 'lucide-react';
import { Product } from '../../types';
import { format } from 'date-fns';

interface ProductDetailsProps {
  product: Product;
  onClose: () => void;
  onUpdate: (product: Product) => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState<Product>(product);

  const handleSave = () => {
    onUpdate(editedProduct);
    setIsEditing(false);
  };

  const getStockStatus = () => {
    if (product.stock === 0) return { status: 'out', color: 'text-red-600', bg: 'bg-red-100', label: 'Out of Stock' };
    if (product.stock <= product.minStock) return { status: 'low', color: 'text-orange-600', bg: 'bg-orange-100', label: 'Low Stock' };
    return { status: 'good', color: 'text-green-600', bg: 'bg-green-100', label: 'In Stock' };
  };

  const stockStatus = getStockStatus();

  // Helper function to safely format date for input
  const formatDateForInput = (date: Date) => {
    if (!date || isNaN(date.getTime())) {
      return '';
    }
    return date.toISOString().split('T')[0];
  };

  // Helper function to safely calculate days to expiry
  const getDaysToExpiry = (expiryDate: Date) => {
    if (!expiryDate || isNaN(expiryDate.getTime())) {
      return 0;
    }
    return Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  };

  // Helper function to safely format date for display
  const formatDateForDisplay = (date: Date) => {
    if (!date || isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return format(date, 'dd/MM/yyyy');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center">
                <Package className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
                <p className="text-gray-600">{product.composition}</p>
                <p className="text-sm text-gray-500">{product.manufacturer}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Product
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              )}
              
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Current Stock</p>
                  <p className="text-2xl font-bold text-gray-900">{product.stock}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.bg} ${stockStatus.color}`}>
                    {stockStatus.label}
                  </span>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Stock Value</p>
                  <p className="text-2xl font-bold text-gray-900">₹{(product.stock * product.price).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">At current price</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Days to Expiry</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {getDaysToExpiry(product.expiryDate)}
                  </p>
                  <p className="text-xs text-gray-500">{formatDateForDisplay(product.expiryDate)}</p>
                </div>
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Margin</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {((product.price - (product.price * 0.8)) / product.price * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">₹{(product.price - (product.price * 0.8)).toFixed(2)} per unit</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProduct.name}
                        onChange={(e) => setEditedProduct(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      <p className="text-gray-900">{product.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Generic Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProduct.genericName}
                        onChange={(e) => setEditedProduct(prev => ({ ...prev, genericName: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      <p className="text-gray-900">{product.genericName}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Composition</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProduct.composition}
                      onChange={(e) => setEditedProduct(prev => ({ ...prev, composition: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  ) : (
                    <p className="text-gray-900">{product.composition}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProduct.manufacturer}
                        onChange={(e) => setEditedProduct(prev => ({ ...prev, manufacturer: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      <p className="text-gray-900">{product.manufacturer}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProduct.category}
                        onChange={(e) => setEditedProduct(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      <p className="text-gray-900">{product.category}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">HSN Code</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProduct.hsnCode}
                        onChange={(e) => setEditedProduct(prev => ({ ...prev, hsnCode: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      <p className="text-gray-900">{product.hsnCode}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pack Units</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProduct.packUnits}
                        onChange={(e) => setEditedProduct(prev => ({ ...prev, packUnits: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      <p className="text-gray-900">{product.packUnits}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Type</label>
                  {isEditing ? (
                    <select
                      value={editedProduct.scheduleType}
                      onChange={(e) => setEditedProduct(prev => ({ ...prev, scheduleType: e.target.value as 'H' | 'X' | 'OTC' }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="OTC">OTC (Over The Counter)</option>
                      <option value="H">Schedule H</option>
                      <option value="X">Schedule X</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">
                      {product.scheduleType === 'OTC' ? 'OTC (Over The Counter)' : `Schedule ${product.scheduleType}`}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Stock</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">MRP (₹)</label>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editedProduct.mrp}
                        onChange={(e) => setEditedProduct(prev => ({ ...prev, mrp: parseFloat(e.target.value) || 0 }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      <p className="text-gray-900">₹{product.mrp.toFixed(2)}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price (₹)</label>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editedProduct.price}
                        onChange={(e) => setEditedProduct(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      <p className="text-gray-900">₹{product.price.toFixed(2)}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editedProduct.stock}
                        onChange={(e) => setEditedProduct(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      <p className="text-gray-900">{product.stock} units</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock Level</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editedProduct.minStock}
                        onChange={(e) => setEditedProduct(prev => ({ ...prev, minStock: parseInt(e.target.value) || 0 }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      <p className="text-gray-900">{product.minStock} units</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProduct.batch}
                        onChange={(e) => setEditedProduct(prev => ({ ...prev, batch: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      <p className="text-gray-900">{product.batch}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={formatDateForInput(editedProduct.expiryDate)}
                        onChange={(e) => setEditedProduct(prev => ({ ...prev, expiryDate: new Date(e.target.value) }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      <p className="text-gray-900">{formatDateForDisplay(product.expiryDate)}</p>
                    )}
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Sale
                    </button>
                    <button className="flex items-center justify-center px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                      <Truck className="w-4 h-4 mr-2" />
                      Purchase Order
                    </button>
                    <button className="flex items-center justify-center px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Reports
                    </button>
                    <button className="flex items-center justify-center px-3 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors">
                      <FileText className="w-4 h-4 mr-2" />
                      Print Label
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
              {isEditing ? (
                <textarea
                  value={editedProduct.description}
                  onChange={(e) => setEditedProduct(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Product description..."
                />
              ) : (
                <p className="text-gray-700">{product.description}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

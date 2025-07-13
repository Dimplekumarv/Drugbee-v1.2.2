import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Edit, 
  Trash2,
  Calendar,
  BarChart3,
  Settings,
  Download,
  Upload,
  X,
  ArrowUpDown,
  Info
} from 'lucide-react';
import { Product } from '../../types';
import ProductDetails from './ProductDetails';
import BatchDetails from './BatchDetails';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

// Define inventory interface to match your backend schema
interface InventoryItem {
  id: number;
  product_id: string;
  product_name: string;
  current_stock: number;
  opening_stock: number;
  cost_price: number;
  selling_price: number;
  mrp: number;
  unit: string;
  pack_size: string;
  hsn_code: string;
  gst_percentage: number;
  vendor_name: string;
  invoice_number: string;
  invoice_date: string;
  batch_number: string;
  expiry_date: string;
  min_stock: number;
  max_stock: number;
  reorder_level: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
}

// Extended Product interface for StockManagement
interface StockProduct extends Product {
  stock: number;
  minStock: number;
  batch: string;
  expiryDate: Date;
  openingStock?: number;
  maxStock?: number;
  reorderLevel?: number;
  vendorName?: string;
  invoiceNumber?: string;
  invoiceDate?: Date;
  unit?: string;
  selling_price?: number;
}

const StockManagement: React.FC = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<StockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<StockProduct | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<{ product: StockProduct; batch: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showAddBatch, setShowAddBatch] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [showBatchHistory, setShowBatchHistory] = useState(false);

  // Fetch inventory data from Supabase
  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        setLoading(true);
        
        console.log('Fetching inventory data...');
        
        // Build query based on filters
        let query = supabase
          .from('inventory')
          .select(`
            id,
            product_id,
            product_name,
            current_stock,
            opening_stock,
            cost_price,
            selling_price,
            mrp,
            unit,
            pack_size,
            hsn_code,
            gst_percentage,
            vendor_name,
            invoice_number,
            invoice_date,
            batch_number,
            expiry_date,
            min_stock,
            max_stock,
            reorder_level,
            is_active,
            created_by,
            created_at,
            updated_by,
            updated_at
          `)
          .eq('is_active', true)
          .order('product_name');

        // Apply vendor filter if selected
        if (selectedVendor) {
          query = query.eq('vendor_name', selectedVendor);
        }

        const { data: inventoryData, error: inventoryError } = await query;

        if (inventoryError) {
          console.error('Inventory fetch error:', inventoryError);
          
          if (inventoryError.code === '42P01') {
            console.warn('Inventory table not found, trying products table...');
            toast.error('Inventory table not found. Please create inventory table first.');
            
            // Fallback to products table
            const { data: productsData, error: productsError } = await supabase
              .from('products')
              .select('*')
              .eq('is_active', true)
              .order('name');

            if (productsError) {
              throw productsError;
            }

            if (productsData) {
              const mappedProducts: StockProduct[] = productsData.map((item: any) => ({
                id: item.id,
                name: item.name,
                generic_name: item.generic_name || '',
                composition: item.composition || '',
                manufacturer: item.manufacturer || '',
                category: item.category || 'General',
                tags: item.tags || [],
                schedule_type: item.schedule_type || 'OTC',
                price: item.price || 0,
                mrp: item.mrp || 0,
                min_stock: item.min_stock || 10,
                batch: '',
                expiry_date: new Date().toISOString(),
                description: item.description || '',
                images: item.images || [],
                is_active: item.is_active !== false,
                pack_units: item.pack_units || '',
                hsn_code: item.hsn_code || '',
                gst_percentage: item.gst_percentage || 12,
                created_at: item.created_at || new Date().toISOString(),
                updated_at: item.updated_at || new Date().toISOString(),
                // StockProduct specific fields
                stock: 0, // No stock data available from products table
                minStock: item.min_stock || 10,
                expiryDate: new Date(),
                openingStock: 0,
                maxStock: 100,
                reorderLevel: 10,
                unit: 'piece'
              }));
              
              setProducts(mappedProducts);
              setInventoryItems([]);
            }
            return;
          } else {
            throw inventoryError;
          }
        }

        console.log('Inventory data fetched:', inventoryData);

        if (inventoryData && inventoryData.length > 0) {
          // Store raw inventory data
          setInventoryItems(inventoryData);
          
          // Also fetch product details to enrich the data
          const productIds = [...new Set(inventoryData.map(item => item.product_id))];
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('id, name, generic_name, composition, manufacturer, category, description, images')
            .in('id', productIds);

          if (productsError) {
            console.warn('Could not fetch product details:', productsError);
          }

          // Create a map of product details
          const productDetailsMap = new Map();
          if (productsData) {
            productsData.forEach(product => {
              productDetailsMap.set(product.id, product);
            });
          }

          // Map inventory data to StockProduct interface with enriched data
          const mappedProducts: StockProduct[] = inventoryData.map((item: InventoryItem) => {
            const productDetails = productDetailsMap.get(item.product_id);
            
            return {
              // Base Product fields
              id: item.product_id,
              name: item.product_name,
              generic_name: productDetails?.generic_name || '',
              composition: productDetails?.composition || '',
              manufacturer: productDetails?.manufacturer || '',
              category: productDetails?.category || 'General',
              tags: [],
              schedule_type: 'OTC',
              price: item.cost_price || 0,
              mrp: item.mrp || item.selling_price || 0,
              min_stock: item.min_stock || 10,
              batch: item.batch_number || '',
              expiry_date: item.expiry_date || new Date().toISOString(),
              description: productDetails?.description || '',
              images: productDetails?.images || [],
              is_active: item.is_active !== false,
              pack_units: item.pack_size || '',
              hsn_code: item.hsn_code || '',
              gst_percentage: item.gst_percentage || 12,
              created_at: item.created_at || new Date().toISOString(),
              updated_at: item.updated_at || new Date().toISOString(),
              // StockProduct specific fields
              stock: item.current_stock || 0,
              minStock: item.min_stock || 10,
              expiryDate: item.expiry_date ? new Date(item.expiry_date) : new Date(),
              openingStock: item.opening_stock || 0,
              maxStock: item.max_stock || 100,
              reorderLevel: item.reorder_level || 10,
              vendorName: item.vendor_name || '',
              invoiceNumber: item.invoice_number || '',
              invoiceDate: item.invoice_date ? new Date(item.invoice_date) : undefined,
              unit: item.unit || 'piece'
            };
          });
          
          setProducts(mappedProducts);
          console.log('Mapped products:', mappedProducts);
          toast.success(`Loaded ${mappedProducts.length} inventory items`);
        } else {
          console.log('No inventory data found');
          setInventoryItems([]);
          setProducts([]);
          toast('No inventory items found. Add products through purchase management.');
        }
      } catch (error: any) {
        console.error('Error fetching inventory data:', error);
        toast.error(`Failed to load inventory data: ${error.message}`);
        setInventoryItems([]);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, []);

  const getStockStatus = (product: StockProduct) => {
    if (product.stock === 0) return { status: 'out', color: 'text-red-600', bg: 'bg-red-100', label: 'Out of Stock' };
    if (product.stock <= product.minStock) return { status: 'low', color: 'text-orange-600', bg: 'bg-orange-100', label: 'Low Stock' };
    return { status: 'good', color: 'text-green-600', bg: 'bg-green-100', label: 'In Stock' };
  };

  const getExpiryStatus = (expiryDate: Date) => {
    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    
    if (expiryDate < today) return { status: 'expired', color: 'text-red-600', bg: 'bg-red-100', label: 'Expired' };
    if (expiryDate <= threeMonthsFromNow) return { status: 'expiring', color: 'text-orange-600', bg: 'bg-orange-100', label: 'Expiring Soon' };
    return { status: 'good', color: 'text-green-600', bg: 'bg-green-100', label: 'Good' };
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.generic_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.composition || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.batch || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.manufacturer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.hsn_code || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (filterBy) {
      case 'low-stock':
        return product.stock <= product.minStock;
      case 'out-of-stock':
        return product.stock === 0;
      case 'expiring':
        const threeMonthsFromNow = new Date();
        threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
        return product.expiryDate <= threeMonthsFromNow && product.expiryDate > new Date();
      case 'expired':
        return product.expiryDate < new Date();
      default:
        return true;
    }
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'stock':
        return b.stock - a.stock;
      case 'expiry':
        return a.expiryDate.getTime() - b.expiryDate.getTime();
      case 'price':
        return b.price - a.price;
      default:
        return 0;
    }
  });

  const stockSummary = {
    totalProducts: products.length,
    totalValue: products.reduce((sum, p) => sum + (p.stock * p.price), 0),
    lowStock: products.filter(p => p.stock <= p.minStock && p.stock > 0).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    expiring: products.filter(p => {
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
      return p.expiryDate <= threeMonthsFromNow && p.expiryDate > new Date();
    }).length,
    expired: products.filter(p => p.expiryDate < new Date()).length
  };

  const handleProductClick = (product: StockProduct) => {
    setSelectedProduct(product);
  };

  const handleBatchClick = (product: StockProduct, batch: string) => {
    setSelectedBatch({ product, batch });
  };

  // Show product details modal
  if (selectedProduct) {
    return (
      <ProductDetails
        product={selectedProduct as Product}
        onClose={() => setSelectedProduct(null)}
        onUpdate={(updatedProduct) => {
          // Convert back to StockProduct when updating
          const updatedStockProduct: StockProduct = {
            ...updatedProduct,
            stock: selectedProduct.stock,
            minStock: selectedProduct.minStock,
            batch: selectedProduct.batch,
            expiryDate: selectedProduct.expiryDate,
            openingStock: selectedProduct.openingStock,
            maxStock: selectedProduct.maxStock,
            reorderLevel: selectedProduct.reorderLevel,
            vendorName: selectedProduct.vendorName,
            invoiceNumber: selectedProduct.invoiceNumber,
            invoiceDate: selectedProduct.invoiceDate,
            unit: selectedProduct.unit
          };
          setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedStockProduct : p));
          setSelectedProduct(updatedStockProduct);
          toast.success('Product updated successfully');
        }}
      />
    );
  }

  // Show batch details modal
  if (selectedBatch) {
    return (
      <BatchDetails
        product={selectedBatch.product as Product}
        batch={selectedBatch.batch}
        onClose={() => setSelectedBatch(null)}
      />
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Stock Management</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Total Value: ₹{stockSummary.totalValue.toLocaleString()}</span>
            <span>•</span>
            <span>{stockSummary.totalProducts} Products</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto mt-4 lg:mt-0">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </button>
          <button 
            onClick={() => setShowAddBatch(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Batch</span>
          </button>
        </div>
      </div>

      {/* Stock Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{stockSummary.totalProducts}</p>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Stock Value</p>
              <p className="text-lg font-bold text-gray-900">₹{(stockSummary.totalValue / 100000).toFixed(1)}L</p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Low Stock</p>
              <p className="text-2xl font-bold text-orange-600">{stockSummary.lowStock}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{stockSummary.outOfStock}</p>
            </div>
            <X className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Expiring</p>
              <p className="text-2xl font-bold text-orange-600">{stockSummary.expiring}</p>
            </div>
            <Calendar className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Expired</p>
              <p className="text-2xl font-bold text-red-600">{stockSummary.expired}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Pharma Products"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">FILTER BY</span>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              >
                <option value="all">All Products</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
                <option value="expiring">Expiring Soon</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">SORT BY</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              >
                <option value="name">Product Name</option>
                <option value="stock">Stock Quantity</option>
                <option value="expiry">Expiry Date</option>
                <option value="price">Price</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Stock on hand - ₹{stockSummary.totalValue.toLocaleString()}
            </h2>
            <div className="text-sm text-gray-500">
              {sortedProducts.length} of {products.length} products
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <span className="ml-2 text-gray-600">Loading inventory data...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory data found</h3>
            <p className="text-gray-500 text-center max-w-md">
              No products found in your inventory. Add products through purchase management or product management.
            </p>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Info
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pricing
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch & Expiry
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor Info
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  HSN & GST
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                const expiryStatus = getExpiryStatus(product.expiryDate);
                
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    {/* Product Details */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div 
                        className="flex items-center cursor-pointer"
                        onClick={() => handleProductClick(product)}
                      >
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                          <Package className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 hover:text-red-600">
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-500">{product.generic_name}</div>
                          <div className="text-xs text-gray-500">{product.manufacturer}</div>
                          <div className="text-xs text-gray-500">Unit: {product.unit || 'piece'}</div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Stock Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            Current: {product.stock}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.bg} ${stockStatus.color}`}>
                            {stockStatus.label}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Opening: {product.openingStock || 0}
                        </div>
                        <div className="text-xs text-gray-500">
                          Min: {product.minStock} | Max: {product.maxStock || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Reorder: {product.reorderLevel || 'N/A'}
                        </div>
                      </div>
                    </td>
                    
                    {/* Pricing */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          MRP: ₹{product.mrp?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Cost: ₹{product.price?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Selling: ₹{product.selling_price?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-xs font-medium text-green-600">
                          Value: ₹{((product.stock || 0) * (product.price || 0)).toFixed(2)}
                        </div>
                      </div>
                    </td>
                    
                    {/* Batch & Expiry */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <button
                          onClick={() => handleBatchClick(product, product.batch)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {product.batch || 'No Batch'}
                        </button>
                        <div className={`text-xs ${expiryStatus.color}`}>
                          Exp: {product.expiryDate.toLocaleDateString('en-GB', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: '2-digit' 
                          })}
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${expiryStatus.bg} ${expiryStatus.color}`}>
                          {expiryStatus.label}
                        </span>
                      </div>
                    </td>
                    
                    {/* Vendor Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900">
                          {product.vendorName || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Invoice: {product.invoiceNumber || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Date: {product.invoiceDate ? 
                            product.invoiceDate.toLocaleDateString('en-GB') : 'N/A'}
                        </div>
                      </div>
                    </td>
                    
                    {/* HSN & GST */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900">
                          HSN: {product.hsn_code || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          GST: {product.gst_percentage || 0}%
                        </div>
                        <div className="text-xs text-gray-500">
                          Pack: {product.pack_units || 'N/A'}
                        </div>
                      </div>
                    </td>
                    
                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleProductClick(product)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleProductClick(product)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900" 
                          title="Delete Product"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this inventory item?')) {
                              // TODO: Implement delete functionality
                              toast.error('Delete functionality not implemented yet');
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {sortedProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => setShowAddBatch(true)}
          className="bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-colors"
          title="Add New Batch"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default StockManagement;

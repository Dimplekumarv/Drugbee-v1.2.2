import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package,
  Download,
  Upload,
  X,
  CheckSquare,
  Square,
  Filter,
  FileText,
  Building2,
  Tag,
  Hash,
  Pill,
  Save,
  Eye,
  Globe,
  Star,
  ShoppingCart,
  AlertTriangle,
  Info
} from 'lucide-react';

import { mockProducts } from '../../data/mockData';
import Papa from 'papaparse';
import { Product } from '../../types';
import toast from 'react-hot-toast';

interface OnlineStoreProduct extends Product {
  isOnlineVisible: boolean;
  onlineCategory: string;
  onlineDescription: string;
  usageInstructions: string;
  sideEffects: string[];
  storageInstructions: string;
  warnings: string[];
  similarMedicines: string[];
  commonUses: string[];
  dosageInstructions: string;
  onlineRating: number;
  onlineReviews: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  productImage?: string;
}

const OnlineStoreProductManagement: React.FC = () => {
  const [products, setProducts] = useState<OnlineStoreProduct[]>(
    mockProducts.map(product => ({
      ...product,
      isOnlineVisible: true,
      onlineCategory: product.category,
      onlineDescription: product.description || 'High-quality medicine for effective treatment',
      usageInstructions: 'Take as directed by physician',
      sideEffects: ['Nausea', 'Dizziness', 'Headache'],
      storageInstructions: 'Store in a cool, dry place away from direct sunlight',
      warnings: ['Do not exceed recommended dose', 'Consult doctor if pregnant'],
      similarMedicines: [],
      commonUses: ['Pain relief', 'Inflammation'],
      dosageInstructions: 'Adults: 1-2 tablets twice daily after meals',
      onlineRating: 4.5,
      onlineReviews: 128,
      isFeatured: false,
      isBestSeller: false
    }))
  );
  
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<OnlineStoreProduct | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [filterByBrand, setFilterByBrand] = useState('');
  const [filterByComposition, setFilterByComposition] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const handleProductSelect = (id: string) => {
    setSelectedProductIds((prevSelected) =>
      prevSelected.includes(id) ? prevSelected.filter((productId) => productId !== id) : [...prevSelected, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map((product) => product.id));
    }
  };
  const [activeTab, setActiveTab] = useState('basic');

  const [currentProduct, setCurrentProduct] = useState<Partial<OnlineStoreProduct>>({
    name: '',
    genericName: '',
    composition: '',
    manufacturer: '',
    category: '',
    onlineCategory: 'Medicines',
    scheduleType: 'OTC',
    packUnits: '',
    hsnCode: '',
    mrp: 0,
    price: 0,
    onlineDescription: '',
    usageInstructions: '',
    sideEffects: [],
    storageInstructions: '',
    warnings: [],
    similarMedicines: [],
    commonUses: [],
    dosageInstructions: '',
    isOnlineVisible: true,
    isFeatured: false,
    isBestSeller: false,
    onlineRating: 4.5,
    onlineReviews: 0,
    productImage: ''
  });

  const handleImageUpload = (file: File) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('File size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('File must be an image');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCurrentProduct(prev => ({
        ...prev,
        productImage: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const onlineCategories = [
    'Medicines',
    'Functional Foods', 
    'Personal Care',
    'Health Devices',
    'Baby Care',
    'Vitamins',
    'First Aid',
    'Beauty'
  ];

  const handleSaveProduct = () => {
    if (!currentProduct.name || !currentProduct.composition || !currentProduct.manufacturer) {
      toast.error('Please fill all required fields');
      return;
    }

    if (editingProduct) {
      const updatedProduct: OnlineStoreProduct = {
        ...editingProduct,
        ...currentProduct,
        updatedAt: new Date()
      } as OnlineStoreProduct;

      setProducts(prev => prev.map(p => p.id === editingProduct.id ? updatedProduct : p));
      toast.success('Product updated successfully');
    } else {
      const newProduct: OnlineStoreProduct = {
        id: (products.length + 1).toString(),
        ...currentProduct,
        stock: 0,
        minStock: 0,
        batch: '',
        expiryDate: new Date(),
        images: [],
        isActive: true,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date()
      } as OnlineStoreProduct;

      setProducts(prev => [newProduct, ...prev]);
      toast.success('Product created successfully');
    }

    resetForm();
  };

  const resetForm = () => {
    setCurrentProduct({
      name: '',
      genericName: '',
      composition: '',
      manufacturer: '',
      category: '',
      onlineCategory: 'Medicines',
      scheduleType: 'OTC',
      packUnits: '',
      hsnCode: '',
      mrp: 0,
      price: 0,
      onlineDescription: '',
      usageInstructions: '',
      sideEffects: [],
      storageInstructions: '',
      warnings: [],
      similarMedicines: [],
      commonUses: [],
      dosageInstructions: '',
      isOnlineVisible: true,
      isFeatured: false,
      isBestSeller: false,
      onlineRating: 4.5,
      onlineReviews: 0,
      productImage: ''
    });
    setShowProductForm(false);
    setEditingProduct(null);
    setActiveTab('basic');
  };

  const handleExportCSV = () => {
    const csvData = products.map(product => ({
      id: product.id,
      name: product.name,
      genericName: product.genericName,
      composition: product.composition,
      manufacturer: product.manufacturer,
      category: product.category,
      onlineCategory: product.onlineCategory,
      scheduleType: product.scheduleType,
      packUnits: product.packUnits,
      hsnCode: product.hsnCode,
      mrp: product.mrp,
      price: product.price,
      onlineDescription: product.onlineDescription,
      usageInstructions: product.usageInstructions,
      sideEffects: product.sideEffects.join('; '),
      storageInstructions: product.storageInstructions,
      warnings: product.warnings.join('; '),
      similarMedicines: product.similarMedicines.join('; '),
      commonUses: product.commonUses.join('; '),
      dosageInstructions: product.dosageInstructions,
      isOnlineVisible: product.isOnlineVisible,
      isFeatured: product.isFeatured,
      isBestSeller: product.isBestSeller,
      onlineRating: product.onlineRating,
      onlineReviews: product.onlineReviews,
      stock: product.stock,
      minStock: product.minStock,
      batch: product.batch,
      expiryDate: product.expiryDate.toISOString().split('T')[0],
      isActive: product.isActive,
      tags: product.tags.join('; '),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString()
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'online_store_products.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Products exported to CSV');
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const importedProducts: OnlineStoreProduct[] = results.data.map((row: any) => ({
            id: row.id || (products.length + 1).toString(),
            name: row.name || '',
            genericName: row.genericName || '',
            composition: row.composition || '',
            manufacturer: row.manufacturer || '',
            category: row.category || '',
            onlineCategory: row.onlineCategory || 'Medicines',
            scheduleType: row.scheduleType || 'OTC',
            packUnits: row.packUnits || '',
            hsnCode: row.hsnCode || '',
            mrp: parseFloat(row.mrp) || 0,
            price: parseFloat(row.price) || 0,
            onlineDescription: row.onlineDescription || '',
            usageInstructions: row.usageInstructions || '',
            sideEffects: row.sideEffects ? row.sideEffects.split('; ').map((s: string) => s.trim()) : [],
            storageInstructions: row.storageInstructions || '',
            warnings: row.warnings ? row.warnings.split('; ').map((w: string) => w.trim()) : [],
            similarMedicines: row.similarMedicines ? row.similarMedicines.split('; ').map((s: string) => s.trim()) : [],
            commonUses: row.commonUses ? row.commonUses.split('; ').map((c: string) => c.trim()) : [],
            dosageInstructions: row.dosageInstructions || '',
            isOnlineVisible: row.isOnlineVisible === 'true',
            isFeatured: row.isFeatured === 'true',
            isBestSeller: row.isBestSeller === 'true',
            onlineRating: parseFloat(row.onlineRating) || 0,
            onlineReviews: parseInt(row.onlineReviews) || 0,
            stock: parseInt(row.stock) || 0,
            minStock: parseInt(row.minStock) || 0,
            batch: row.batch || '',
            expiryDate: row.expiryDate ? new Date(row.expiryDate) : new Date(),
            images: [],
            isActive: row.isActive === 'true',
            tags: row.tags ? row.tags.split('; ').map((t: string) => t.trim()) : [],
            createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
            updatedAt: new Date()
          }));
          setProducts(prev => [...prev, ...importedProducts]);
          toast.success(`${importedProducts.length} products imported successfully`);
        },
        error: (error) => {
          toast.error(`CSV parsing error: ${error.message}`);
        }
      });
    }
  };

  const handleEdit = (product: OnlineStoreProduct) => {
    setCurrentProduct(product);
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleToggleVisibility = (productId: string) => {
    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, isOnlineVisible: !p.isOnlineVisible, updatedAt: new Date() }
        : p
    ));
    toast.success('Product visibility updated');
  };

  const handleToggleFeatured = (productId: string) => {
    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, isFeatured: !p.isFeatured, updatedAt: new Date() }
        : p
    ));
    toast.success('Featured status updated');
  };

  const handleToggleBestSeller = (productId: string) => {
    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, isBestSeller: !p.isBestSeller, updatedAt: new Date() }
        : p
    ));
    toast.success('Best seller status updated');
  };

  const handleDeleteSelectedProducts = () => {
    if (selectedProductIds.length === 0) {
      toast.error('No products selected for deletion.');
      return;
    }
    setProducts(prev => prev.filter(p => !selectedProductIds.includes(p.id)));
    setSelectedProductIds([]);
    toast.success(`${selectedProductIds.length} products deleted successfully.`);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.composition.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBrand = filterByBrand === '' || product.manufacturer.toLowerCase().includes(filterByBrand.toLowerCase());
    const matchesComposition = filterByComposition === '' || product.composition.toLowerCase().includes(filterByComposition.toLowerCase());

    if (!matchesSearch || !matchesBrand || !matchesComposition) return false;
    
    switch (filterBy) {
      case 'visible':
        return product.isOnlineVisible;
      case 'hidden':
        return !product.isOnlineVisible;
      case 'featured':
        return product.isFeatured;
      case 'bestseller':
        return product.isBestSeller;
      default:
        return true;
    }
  });

  const addArrayItem = (field: 'sideEffects' | 'warnings' | 'similarMedicines' | 'commonUses', value: string) => {
    if (value.trim()) {
      setCurrentProduct(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), value.trim()]
      }));
    }
  };

  const removeArrayItem = (field: 'sideEffects' | 'warnings' | 'similarMedicines' | 'commonUses', index: number) => {
    setCurrentProduct(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
            <Globe className="w-6 h-6 mr-2 text-blue-600" />
            Online Store Products
          </h1>
          <p className="text-gray-600">Manage products displayed in the online store</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto mt-4 lg:mt-0">
          <button
            onClick={handleExportCSV}
            className="bg-green-600 text-white px-2 py-1 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <label
            htmlFor="import-csv"
            className="bg-purple-600 text-white px-2 py-1 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Import CSV</span>
            <input
              id="import-csv"
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
          </label>
          <button
            onClick={() => setShowProductForm(true)}
            className="bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Online Product</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="relative w-full lg:w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-2 py-1 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative w-full lg:w-1/4">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Filter by Brand..."
              className="w-full pl-10 pr-2 py-1 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={filterByBrand}
              onChange={(e) => setFilterByBrand(e.target.value)}
            />
          </div>

          <div className="relative w-full lg:w-1/4">
            <Pill className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Filter by Composition..."
              className="w-full pl-10 pr-2 py-1 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={filterByComposition}
              onChange={(e) => setFilterByComposition(e.target.value)}
            />
          </div>

          <div className="relative w-full lg:w-1/4">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              className="w-full pl-10 pr-2 py-1 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none"
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
            >
              <option value="all">All Products</option>
              <option value="visible">Online Visible</option>
              <option value="hidden">Online Hidden</option>
              <option value="featured">Featured</option>
              <option value="bestseller">Best Seller</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleDeleteSelectedProducts}
            disabled={selectedProductIds.length === 0}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${selectedProductIds.length > 0 ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Selected ({selectedProductIds.length})</span>
          </button>
        </div>




      </div>
       {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Online Store Products ({filteredProducts.length} products)
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-600 rounded"
                    checked={selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pricing
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-blue-600 rounded"
                      checked={selectedProductIds.includes(product.id)}
                      onChange={() => handleProductSelect(product.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {product.productImage ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden mr-3">
                          <img
                            src={product.productImage}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <a href={`/product/${product.id}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline">
                          {product.name}
                        </a>
                        <div className="text-sm text-gray-500">{product.composition}</div>
                        <div className="text-xs text-gray-400">{product.manufacturer}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {product.onlineCategory}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">₹{product.price}</div>
                    {product.mrp > product.price && (
                      <div className="text-xs text-gray-500 line-through">₹{product.mrp}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-900 ml-1">{product.onlineRating}</span>
                      <span className="text-xs text-gray-500 ml-1">({product.onlineReviews})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.isOnlineVisible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.isOnlineVisible ? 'Visible' : 'Hidden'}
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        {product.isFeatured && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            Featured
                          </span>
                        )}
                        {product.isBestSeller && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                            Best Seller
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleVisibility(product.id)}
                        className={`${product.isOnlineVisible ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        title={product.isOnlineVisible ? 'Hide from Store' : 'Show in Store'}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleFeatured(product.id)}
                        className={`${product.isFeatured ? 'text-purple-600' : 'text-gray-400'} hover:text-purple-900`}
                        title="Toggle Featured"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleBestSeller(product.id)}
                        className={`${product.isBestSeller ? 'text-orange-600' : 'text-gray-400'} hover:text-orange-900`}
                        title="Toggle Best Seller"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingProduct ? 'Edit Online Store Product' : 'Add Online Store Product'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8">
                  {[
                    { id: 'basic', label: 'Basic Info', icon: Package },
                    { id: 'description', label: 'Description', icon: FileText },
                    { id: 'usage', label: 'Usage & Dosage', icon: Pill },
                    { id: 'warnings', label: 'Warnings & Storage', icon: AlertTriangle },
                    { id: 'similar', label: 'Similar Medicines', icon: Tag }
                  ].map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="space-y-6">
                {/* Basic Info Tab */}
                {activeTab === 'basic' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Product Image
                        </label>
                        <div 
                          className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors"
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                        >
                          <div className="space-y-1 text-center">
                            {currentProduct.productImage ? (
                              <div className="relative w-full h-48 mb-4">
                                <img
                                  src={currentProduct.productImage}
                                  alt="Product preview"
                                  className="mx-auto h-full object-contain"
                                />
                                <button
                                  onClick={() => setCurrentProduct(prev => ({ ...prev, productImage: '' }))}
                                  className="absolute top-0 right-0 bg-red-100 text-red-600 p-1 rounded-full hover:bg-red-200"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                  <label
                                    htmlFor="product-image"
                                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                  >
                                    <span>Upload a file</span>
                                    <input
                                      id="product-image"
                                      name="product-image"
                                      type="file"
                                      accept="image/*"
                                      className="sr-only"
                                      onChange={handleFileInputChange}
                                    />
                                  </label>
                                  <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">
                                  PNG, JPG, GIF up to 5MB
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          value={currentProduct.name || ''}
                          onChange={(e) => setCurrentProduct(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="e.g., AB PHYLLINE CAP"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Generic Name
                        </label>
                        <input
                          type="text"
                          value={currentProduct.genericName || ''}
                          onChange={(e) => setCurrentProduct(prev => ({ ...prev, genericName: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="e.g., Acebrophylline"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Composition *
                        </label>
                        <input
                          type="text"
                          value={currentProduct.composition || ''}
                          onChange={(e) => setCurrentProduct(prev => ({ ...prev, composition: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="e.g., Acebrophylline 100 mg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Manufacturer *
                        </label>
                        <input
                          type="text"
                          value={currentProduct.manufacturer || ''}
                          onChange={(e) => setCurrentProduct(prev => ({ ...prev, manufacturer: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="e.g., Sun Pharma"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Online Category *
                        </label>
                        <select
                          value={currentProduct.onlineCategory || 'Medicines'}
                          onChange={(e) => setCurrentProduct(prev => ({ ...prev, onlineCategory: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                          {onlineCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            MRP (₹) *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={currentProduct.mrp || ''}
                            onChange={(e) => setCurrentProduct(prev => ({ ...prev, mrp: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sale Price (₹) *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={currentProduct.price || ''}
                            onChange={(e) => setCurrentProduct(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700">
                            Visible in Online Store
                          </label>
                          <button
                            onClick={() => setCurrentProduct(prev => ({ ...prev, isOnlineVisible: !prev.isOnlineVisible }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              currentProduct.isOnlineVisible ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                currentProduct.isOnlineVisible ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700">
                            Featured Product
                          </label>
                          <button
                            onClick={() => setCurrentProduct(prev => ({ ...prev, isFeatured: !prev.isFeatured }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              currentProduct.isFeatured ? 'bg-purple-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                currentProduct.isFeatured ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700">
                            Best Seller
                          </label>
                          <button
                            onClick={() => setCurrentProduct(prev => ({ ...prev, isBestSeller: !prev.isBestSeller }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              currentProduct.isBestSeller ? 'bg-orange-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                currentProduct.isBestSeller ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Description Tab */}
                {activeTab === 'description' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Description *
                      </label>
                      <textarea
                        value={currentProduct.onlineDescription || ''}
                        onChange={(e) => setCurrentProduct(prev => ({ ...prev, onlineDescription: e.target.value }))}
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Describe what this medicine is used for and its benefits..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Common Uses
                      </label>
                      <div className="space-y-2">
                        {(currentProduct.commonUses || []).map((use, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={use}
                              onChange={(e) => {
                                const newUses = [...(currentProduct.commonUses || [])];
                                newUses[index] = e.target.value;
                                setCurrentProduct(prev => ({ ...prev, commonUses: newUses }));
                              }}
                              className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                            <button
                              onClick={() => removeArrayItem('commonUses', index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="Add common use..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addArrayItem('commonUses', e.currentTarget.value);
                                e.currentTarget.value = '';
                              }
                            }}
                            className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                          <button
                            onClick={(e) => {
                              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                              addArrayItem('commonUses', input.value);
                              input.value = '';
                            }}
                            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Usage & Dosage Tab */}
                {activeTab === 'usage' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dosage & Administration
                      </label>
                      <textarea
                        value={currentProduct.dosageInstructions || ''}
                        onChange={(e) => setCurrentProduct(prev => ({ ...prev, dosageInstructions: e.target.value }))}
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="e.g., Adults: 1-2 tablets twice daily after meals"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Usage Instructions
                      </label>
                      <textarea
                        value={currentProduct.usageInstructions || ''}
                        onChange={(e) => setCurrentProduct(prev => ({ ...prev, usageInstructions: e.target.value }))}
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="How to use this medicine..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Possible Side Effects
                      </label>
                      <div className="space-y-2">
                        {(currentProduct.sideEffects || []).map((effect, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={effect}
                              onChange={(e) => {
                                const newEffects = [...(currentProduct.sideEffects || [])];
                                newEffects[index] = e.target.value;
                                setCurrentProduct(prev => ({ ...prev, sideEffects: newEffects }));
                              }}
                              className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                            <button
                              onClick={() => removeArrayItem('sideEffects', index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="Add side effect..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addArrayItem('sideEffects', e.currentTarget.value);
                                e.currentTarget.value = '';
                              }
                            }}
                            className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                          <button
                            onClick={(e) => {
                              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                              addArrayItem('sideEffects', input.value);
                              input.value = '';
                            }}
                            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Warnings & Storage Tab */}
                {activeTab === 'warnings' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Storage Instructions
                      </label>
                      <textarea
                        value={currentProduct.storageInstructions || ''}
                        onChange={(e) => setCurrentProduct(prev => ({ ...prev, storageInstructions: e.target.value }))}
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="e.g., Store in a cool, dry place away from direct sunlight"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Important Warnings
                      </label>
                      <div className="space-y-2">
                        {(currentProduct.warnings || []).map((warning, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={warning}
                              onChange={(e) => {
                                const newWarnings = [...(currentProduct.warnings || [])];
                                newWarnings[index] = e.target.value;
                                setCurrentProduct(prev => ({ ...prev, warnings: newWarnings }));
                              }}
                              className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                            <button
                              onClick={() => removeArrayItem('warnings', index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="Add warning..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addArrayItem('warnings', e.currentTarget.value);
                                e.currentTarget.value = '';
                              }
                            }}
                            className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                          <button
                            onClick={(e) => {
                              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                              addArrayItem('warnings', input.value);
                              input.value = '';
                            }}
                            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Similar Medicines Tab */}
                {activeTab === 'similar' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Similar Medicines (Product IDs)
                      </label>
                      <div className="space-y-2">
                        {(currentProduct.similarMedicines || []).map((medicineId, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={medicineId}
                              onChange={(e) => {
                                const newMedicines = [...(currentProduct.similarMedicines || [])];
                                newMedicines[index] = e.target.value;
                                setCurrentProduct(prev => ({ ...prev, similarMedicines: newMedicines }));
                              }}
                              className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              placeholder="Product ID"
                            />
                            <button
                              onClick={() => removeArrayItem('similarMedicines', index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="Add similar medicine ID..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addArrayItem('similarMedicines', e.currentTarget.value);
                                e.currentTarget.value = '';
                              }
                            }}
                            className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                          <button
                            onClick={(e) => {
                              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                              addArrayItem('similarMedicines', input.value);
                              input.value = '';
                            }}
                            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                        <div className="flex items-start">
                          <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                          <div>
                            <h4 className="text-sm font-medium text-blue-800">Similar Medicines</h4>
                            <p className="text-sm text-blue-700 mt-1">
                              Add product IDs of medicines with similar composition or therapeutic effects. These will be shown as alternatives to customers.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
                <button
                  onClick={resetForm}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProduct}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingProduct ? 'Update Product' : 'Save Product'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnlineStoreProductManagement;

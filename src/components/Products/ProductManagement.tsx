import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
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
  Building2,
  Tag,
  Hash,
  ClipboardList
} from 'lucide-react';
import { Product } from '../../types';
import toast from 'react-hot-toast';


const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from Supabase on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products');
        toast.error('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);
  const [showImport, setShowImport] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({
    name: '',
    generic_name: '',
    composition: '',
    manufacturer: '',
    category: '',
    schedule_type: 'OTC',
    pack_units: '',
    hsn_code: '',
    gst_percentage: 0,
    tags: [],
    is_active: true
  });

  const categories = [
    'Analgesic', 'Antibiotic', 'Antihistamine', 'Antacid', 'Antidiabetic',
    'Antihypertensive', 'Cardiovascular', 'Respiratory', 'Dermatological',
    'Gastrointestinal', 'Neurological', 'Vitamins & Supplements', 'Ayurvedic',
    'Homeopathic', 'Surgical', 'Baby Care', 'Personal Care'
  ];

  const manufacturers = [
    'Cipla', 'Sun Pharma', 'Dr. Reddy\'s', 'Lupin', 'Aurobindo',
    'Torrent Pharma', 'Glenmark', 'Cadila Healthcare', 'Alkem Labs',
    'GSK', 'Pfizer', 'Novartis', 'Abbott', 'Sanofi', 'Mankind Pharma',
    'Zydus Cadila', 'Biocon', 'Divi\'s Labs', 'Hetero Drugs','Microlabs'
  ];

  const handleSaveProduct = async () => {
    if (!currentProduct.name || !currentProduct.composition || !currentProduct.hsn_code || currentProduct.gst_percentage === undefined) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (editingProduct) {
        // Format data according to the database schema
        const updatedProduct = {
          name: currentProduct.name?.trim(),
          generic_name: currentProduct.generic_name?.trim() || '',
          composition: currentProduct.composition?.trim(),
          manufacturer: currentProduct.manufacturer?.trim() || '',
          category: currentProduct.category?.trim() || '',
          tags: Array.isArray(currentProduct.tags) ? currentProduct.tags : [],
          schedule_type: currentProduct.schedule_type || 'OTC',
          pack_units: currentProduct.pack_units?.trim() || '',
          hsn_code: currentProduct.hsn_code?.trim(),
          gst_percentage: typeof currentProduct.gst_percentage === 'number' ? currentProduct.gst_percentage : 0,
          updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('products')
          .update(updatedProduct)
          .eq('id', editingProduct.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating product:', error);
          setError(error.message);
          toast.error('Failed to update product');
          return;
        }

        setProducts(prev => prev.map(p => p.id === editingProduct.id ? data : p));
        toast.success('Product updated successfully');
      } else {
        // Format data according to the database schema
        const newProduct = {
          name: currentProduct.name?.trim(),
          generic_name: currentProduct.generic_name?.trim() || '',
          composition: currentProduct.composition?.trim(),
          manufacturer: currentProduct.manufacturer?.trim() || '',
          category: currentProduct.category?.trim() || '',
          tags: Array.isArray(currentProduct.tags) ? currentProduct.tags : [],
          schedule_type: currentProduct.schedule_type || 'OTC',
          price: 0,
          mrp: 0,
          min_stock: 0,
          batch: '',
          expiry_date: new Date().toISOString(),
          description: '',
          images: [],
          is_active: true,
          pack_units: currentProduct.pack_units?.trim() || '',
          hsn_code: currentProduct.hsn_code?.trim(),
          gst_percentage: typeof currentProduct.gst_percentage === 'number' ? currentProduct.gst_percentage : 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('products')
          .insert(newProduct)
          .select()
          .single();

        if (error) throw error;

        setProducts(prev => [...prev, data]);
        toast.success('Product created successfully');
      }
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      setError(error instanceof Error ? error.message : 'Failed to save product');
      toast.error('Failed to save product');
    } finally {
      setIsLoading(false);
    }

  };

  const resetForm = () => {
    setCurrentProduct({
      name: '',
      generic_name: '',
      composition: '',
      manufacturer: '',
      category: '',
      schedule_type: 'OTC',
      pack_units: '',
      hsn_code: '',
      gst_percentage: 0,
      tags: [],
      is_active: true
    });
    setShowNewProduct(false);
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setCurrentProduct(product);
    setEditingProduct(product);
    setShowNewProduct(true);
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', productId);

        if (error) throw error;

        setProducts(prev => prev.filter(p => p.id !== productId));
        setSelectedProducts(prev => prev.filter(id => id !== productId));
        toast.success('Product deleted successfully');
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      toast.error('Please select products to delete');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .in('id', selectedProducts);

        if (error) throw error;

        setProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)));
        setSelectedProducts([]);
        toast.success(`${selectedProducts.length} products deleted successfully`);
      } catch (error) {
        console.error('Error bulk deleting products:', error);
        toast.error('Failed to delete products');
      }
    }
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleExport = (type: 'selected' | 'all') => {
    const productsToExport = type === 'selected' 
      ? products.filter(p => selectedProducts.includes(p.id))
      : products;

    if (type === 'selected' && selectedProducts.length === 0) {
      toast.error('Please select products to export');
      return;
    }

    const csvContent = [
      'Name,Generic Name,Composition,Manufacturer,Category,HSN Code,Pack Units,Schedule Type',
      ...productsToExport.map(p => 
        `"${p.name}","${p.generic_name}","${p.composition}","${p.manufacturer}","${p.category}","${p.hsn_code}","${p.pack_units}","${p.schedule_type}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-${type}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success(`${productsToExport.length} products exported successfully`);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
        
        if (lines.length === 0) {
          toast.error('CSV file is empty');
          return;
        }

        // Skip header row and process data
        const importedProducts = lines.slice(1).map((line) => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          
          if (values.length < 8) {
            console.warn('Skipping invalid CSV line:', line);
            return null;
          }

          return {
            name: values[0],
            generic_name: values[1],
            composition: values[2],
            manufacturer: values[3],
            category: values[4],
            hsn_code: values[5],
            pack_units: values[6],
            schedule_type: values[7] as 'H' | 'X' | 'OTC',
            price: 0,
            mrp: 0,
            stock: 0,
            min_stock: 0,
            batch: '',
            expiry_date: new Date().toISOString(),
            description: '',
            images: [],
            is_active: true,
            tags: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        })
        .filter((product): product is any => product !== null);

        const { data, error } = await supabase
          .from('products')
          .insert(importedProducts)
          .select();

        if (error) throw error;

        setProducts(prev => [...prev, ...data]);
        setShowImport(false);
        toast.success(`${importedProducts.length} products imported successfully`);
      } catch (error) {
        console.error('Error importing products:', error);
        toast.error('Failed to import products. Please check file format and try again.');
      }
    };
    reader.readAsText(file);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.generic_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.composition.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (filterBy) {
      case 'schedule-h':
        return product.schedule_type === 'H';
      case 'schedule-x':
        return product.schedule_type === 'X';
      case 'otc':
        return product.schedule_type === 'OTC';
      case 'inactive':
        return !product.is_active;
      default:
        return product.is_active;
    }
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Database</h1>
          <p className="text-gray-600">Manage your product catalog and information</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto mt-4 lg:mt-0">
          <button
            onClick={() => setShowImport(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Import Products</span>
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleExport('selected')}
              disabled={selectedProducts.length === 0}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Export Selected</span>
            </button>
            <button
              onClick={() => handleExport('all')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export All</span>
            </button>
          </div>
          
          <button
            onClick={() => setShowNewProduct(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products by name, composition, or manufacturer..."
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
                <option value="schedule-h">Schedule H</option>
                <option value="schedule-x">Schedule X</option>
                <option value="otc">OTC</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            {selectedProducts.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center space-x-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete ({selectedProducts.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Product Database ({isLoading ? '...' : `${filteredProducts.length} products`})
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSelectAll}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
              >
                {selectedProducts.length === filteredProducts.length ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                <span>Select All</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Information
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Composition
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Manufacturer
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  HSN & Pack
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
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
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleSelectProduct(product.id)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                        <Package className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.generic_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.composition}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{product.manufacturer}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Tag className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{product.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">HSN: {product.hsn_code}</div>
                    <div className="text-sm text-gray-500">Pack: {product.pack_units}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.schedule_type === 'H' ? 'bg-orange-100 text-orange-800' :
                      product.schedule_type === 'X' ? 'bg-red-100 text-red-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {product.schedule_type === 'OTC' ? 'OTC' : `Schedule ${product.schedule_type}`}
                    </span>
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
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900">Loading products...</h3>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">Failed to load products</h3>
            <p className="text-red-500">{error}</p>
          </div>
        ) : filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {showNewProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Product Information
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={currentProduct.name || ''}
                      onChange={(e) => setCurrentProduct(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                      placeholder="e.g., AB PHYLLINE CAP"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Generic Name
                    </label>
                    <input
                      type="text"
                      value={currentProduct.generic_name || ''}
                      onChange={(e) => setCurrentProduct(prev => ({ ...prev, generic_name: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                      placeholder="e.g., Acebrophylline 100 mg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Manufacturer *
                    </label>
                    <select
                      value={currentProduct.manufacturer || ''}
                      onChange={(e) => setCurrentProduct(prev => ({ ...prev, manufacturer: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    >
                      <option value="">Select Manufacturer</option>
                      {manufacturers.map(mfg => (
                        <option key={mfg} value={mfg}>{mfg}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Classification & Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Hash className="w-5 h-5 mr-2" />
                    Classification & Details
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={currentProduct.category || ''}
                      onChange={(e) => setCurrentProduct(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      HSN Code *
                    </label>
                    <input
                      type="text"
                      value={currentProduct.hsn_code || ''}
                      onChange={(e) => setCurrentProduct(prev => ({ ...prev, hsn_code: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                      placeholder="e.g., 3004"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      %GST *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={currentProduct.gst_percentage ?? ''}
                      onChange={(e) => setCurrentProduct(prev => ({ ...prev, gst_percentage: parseFloat(e.target.value) || 0 }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                      placeholder="e.g., 12"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pack Units *
                    </label>
                    <input
                      type="text"
                      value={currentProduct.pack_units || ''}
                      onChange={(e) => setCurrentProduct(prev => ({ ...prev, pack_units: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                      placeholder="e.g., 1x10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Schedule Type *
                    </label>
                    <select
                      value={currentProduct.schedule_type || 'OTC'}
                      onChange={(e) => setCurrentProduct(prev => ({ ...prev, schedule_type: e.target.value as 'H' | 'X' | 'OTC' }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    >
                      <option value="OTC">OTC (Over The Counter)</option>
                      <option value="H">Schedule H</option>
                      <option value="X">Schedule X</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 mt-6 pt-6 border-t">
                <button
                  onClick={resetForm}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProduct}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  {editingProduct ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center"><ClipboardList className="w-5 h-5 mr-2" /> Import Products</h2>
                <button
                  onClick={() => setShowImport(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload CSV File
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleImport}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">CSV Format:</h4>
                  <p className="text-sm text-blue-700">
                    Name, Generic Name, Composition, Manufacturer, Category, HSN Code, Pack Units, Schedule Type
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;

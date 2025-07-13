import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Download, 
  Printer, 
  Calendar,
  TrendingUp,
  Receipt,
  X,
  ShoppingCart,
  ArrowLeft,
  Settings,
  Save,
  Info,
  CheckCircle,
  BarChart3,
  Users,
  Phone,
  Eye,
  Filter
} from 'lucide-react';
import { mockSales, mockProducts } from '../../data/mockData';
import { Sale, Product, SaleItem } from '../../types';
import { generateBillPDF } from '../../utils/pdf';
import { updateInventoryOnSale, getProductSuggestions } from '../../utils/inventory';
import BillPreview from './BillPreview';
import { format, addDays } from 'date-fns';
import toast from 'react-hot-toast';

const SalesManagement: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>(mockSales);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [showNewSale, setShowNewSale] = useState(false);
  const [showBillPreview, setShowBillPreview] = useState(false);
  const [previewSale, setPreviewSale] = useState<Sale | null>(null);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [viewMode, setViewMode] = useState<'customer' | 'sales'>('customer');
  const [searchTerm, setSearchTerm] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [saleType, setSaleType] = useState<'invoice' | 'delivery'>('invoice');
  const [currentSale, setCurrentSale] = useState<Partial<Sale>>({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    doctorName: '',
    items: [],
    paymentMethod: 'cash',
    discount: 0,
    followUpDate: addDays(new Date(), 30),
    followUpNotes: ''
  });

  // Group sales by customer (phone number) or show individual sales
  const groupedSales = React.useMemo(() => {
    const filtered = sales.filter(sale =>
      sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customerPhone.includes(searchTerm) ||
      sale.billNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (viewMode === 'customer') {
      const grouped = filtered.reduce((acc, sale) => {
        if (sale.customerName === 'Cash Sale') {
          // Group all cash sales together
          if (!acc['cash-sales']) {
            acc['cash-sales'] = {
              customerName: 'Cash Sales',
              customerPhone: '',
              sales: [],
              totalAmount: 0,
              lastSaleDate: new Date(0)
            };
          }
          acc['cash-sales'].sales.push(sale);
          acc['cash-sales'].totalAmount += sale.total;
          if (sale.createdAt > acc['cash-sales'].lastSaleDate) {
            acc['cash-sales'].lastSaleDate = sale.createdAt;
          }
        } else {
          // Group by phone number for regular customers
          const key = sale.customerPhone;
          if (!acc[key]) {
            acc[key] = {
              customerName: sale.customerName,
              customerPhone: sale.customerPhone,
              sales: [],
              totalAmount: 0,
              lastSaleDate: new Date(0)
            };
          }
          acc[key].sales.push(sale);
          acc[key].totalAmount += sale.total;
          if (sale.createdAt > acc[key].lastSaleDate) {
            acc[key].lastSaleDate = sale.createdAt;
          }
        }
        return acc;
      }, {} as Record<string, {
        customerName: string;
        customerPhone: string;
        sales: Sale[];
        totalAmount: number;
        lastSaleDate: Date;
      }>);

      return Object.values(grouped).sort((a, b) => b.lastSaleDate.getTime() - a.lastSaleDate.getTime());
    } else {
      return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  }, [sales, searchTerm, viewMode]);

  const handlePrintBill = (sale: Sale, format: 'A4' | 'A5' = 'A4') => {
    generateBillPDF(sale, format);
    toast.success(`Bill generated in ${format} format`);
  };

  const addItemToSale = (product: Product, quantity: number = 1) => {
    if (product.stock <= 0) {
      toast.error('Product out of stock');
      return;
    }

    const existingItemIndex = currentSale.items?.findIndex(item => item.productId === product.id);
    
    if (existingItemIndex !== undefined && existingItemIndex >= 0) {
      const updatedItems = [...(currentSale.items || [])];
      const existingItem = updatedItems[existingItemIndex];
      
      if (existingItem.quantity + quantity > product.stock) {
        toast.error('Cannot add more items than available stock');
        return;
      }
      
      existingItem.quantity += quantity;
      existingItem.total = existingItem.quantity * existingItem.price;
      
      setCurrentSale(prev => ({
        ...prev,
        items: updatedItems
      }));
    } else {
      const newItem: SaleItem = {
        productId: product.id,
        productName: product.name,
        quantity: quantity,
        price: product.price,
        discount: 0,
        total: product.price * quantity,
        batch: product.batch,
        expiryDate: product.expiryDate,
        hsnCode: product.hsnCode,
        packUnits: product.packUnits,
        cgst: 6,
        sgst: 6
      };

      setCurrentSale(prev => ({
        ...prev,
        items: [...(prev.items || []), newItem]
      }));
    }
    
    setProductSearch('');
    setSelectedProduct(null);
    toast.success(`Added ${product.name} to sale`);
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(index);
      return;
    }

    const updatedItems = [...(currentSale.items || [])];
    const item = updatedItems[index];
    const product = products.find(p => p.id === item.productId);
    
    if (product && quantity > product.stock) {
      toast.error('Cannot exceed available stock');
      return;
    }
    
    item.quantity = quantity;
    item.total = quantity * item.price;
    
    setCurrentSale(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const removeItem = (index: number) => {
    const updatedItems = [...(currentSale.items || [])];
    updatedItems.splice(index, 1);
    
    setCurrentSale(prev => ({
      ...prev,
      items: updatedItems
    }));
    toast.success('Item removed from sale');
  };

  const completeSale = () => {
    if (!currentSale.customerName || !currentSale.items?.length) {
      toast.error('Please fill all required fields and add items');
      return;
    }

    const subtotal = currentSale.items.reduce((sum, item) => sum + item.total, 0);
    const discount = currentSale.discount || 0;
    const discountAmount = (subtotal * discount) / 100;
    const afterDiscount = subtotal - discountAmount;
    const tax = afterDiscount * 0.12;
    const total = afterDiscount + tax;

    const newSale: Sale = {
      id: (sales.length + 1).toString(),
      customerId: undefined,
      customerName: currentSale.customerName!,
      customerPhone: currentSale.customerPhone!,
      customerAddress: currentSale.customerAddress,
      doctorName: currentSale.doctorName,
      items: currentSale.items,
      subtotal,
      discount: discountAmount,
      tax,
      total,
      paymentMethod: currentSale.paymentMethod!,
      status: 'completed',
      createdBy: '1',
      createdAt: new Date(),
      billNumber: `DHS-2024-${String(sales.length + 1).padStart(3, '0')}`,
      gstNumber: '29ABYPB7940B1ZF',
      followUpDate: currentSale.followUpDate,
      followUpNotes: currentSale.followUpNotes
    };

    const updatedProducts = updateInventoryOnSale(products, newSale);
    setProducts(updatedProducts);

    setSales(prev => [newSale, ...prev]);
    
    // Show bill preview instead of directly printing
    setPreviewSale(newSale);
    setShowBillPreview(true);
    setShowNewSale(false);
    
    // Reset current sale
    setCurrentSale({
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      doctorName: '',
      items: [],
      paymentMethod: 'cash',
      discount: 0,
      followUpDate: addDays(new Date(), 30),
      followUpNotes: ''
    });
    
    toast.success('Sale completed successfully');
  };

  const productSuggestions = getProductSuggestions(products, productSearch);
  const frequentlyBought = products.slice(0, 3);

  const subtotal = currentSale.items?.reduce((sum, item) => sum + item.total, 0) || 0;
  const discountAmount = (subtotal * (currentSale.discount || 0)) / 100;
  const afterDiscount = subtotal - discountAmount;
  const gstAmount = afterDiscount * 0.12;
  const totalAmount = afterDiscount + gstAmount;
  const totalQuantity = currentSale.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // Show bill preview
  if (showBillPreview && previewSale) {
    return (
      <BillPreview
        sale={previewSale}
        onClose={() => {
          setShowBillPreview(false);
          setPreviewSale(null);
        }}
        onBack={() => {
          setShowBillPreview(false);
          setShowNewSale(true);
        }}
      />
    );
  }

  // Show sale details
  if (selectedSale) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSelectedSale(null)}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Sales
            </button>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => handlePrintBill(selectedSale, 'A4')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Bill</span>
            </button>
            <button
              onClick={() => {
                setPreviewSale(selectedSale);
                setShowBillPreview(true);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>View Bill</span>
            </button>
          </div>
        </div>

        {/* Sale Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sale Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bill Number:</span>
                  <span className="font-medium">{selectedSale.billNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{format(selectedSale.createdAt, 'dd/MM/yyyy HH:mm')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium capitalize">{selectedSale.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium capitalize">{selectedSale.status}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{selectedSale.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{selectedSale.customerPhone}</span>
                </div>
                {selectedSale.customerAddress && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-medium">{selectedSale.customerAddress}</span>
                  </div>
                )}
                {selectedSale.doctorName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Doctor:</span>
                    <span className="font-medium">{selectedSale.doctorName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selectedSale.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.productName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.batch}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">₹{item.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">₹{item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="border-t pt-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">₹{selectedSale.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-medium">₹{selectedSale.discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">₹{selectedSale.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>₹{selectedSale.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Follow-up Information */}
          {selectedSale.followUpDate && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Follow-up Information</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Follow-up Date: {format(selectedSale.followUpDate, 'dd/MM/yyyy')}</span>
                </div>
                {selectedSale.followUpNotes && (
                  <p className="text-blue-800 text-sm">{selectedSale.followUpNotes}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (showNewSale) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowNewSale(false)}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Add New Sale
              </button>
              <span className="text-sm text-gray-500">(Press Esc to Cancel)</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="flex items-center px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
                <Settings className="w-4 h-4 mr-2" />
                Invoice Settings
              </button>
              <button
                onClick={completeSale}
                disabled={!currentSale.items?.length}
                className="flex items-center px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                Save (F4)
              </button>
            </div>
          </div>
        </div>

        {/* Main Content with proper spacing for bottom bar */}
        <div className="p-6 pb-48">
          {/* Sale Type and Basic Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sale Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SALE TYPE*
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="saleType"
                      value="invoice"
                      checked={saleType === 'invoice'}
                      onChange={(e) => setSaleType(e.target.value as 'invoice' | 'delivery')}
                      className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                    />
                    <span className="ml-2 text-sm text-gray-900">Invoice</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="saleType"
                      value="delivery"
                      checked={saleType === 'delivery'}
                      onChange={(e) => setSaleType(e.target.value as 'invoice' | 'delivery')}
                      className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                    />
                    <span className="ml-2 text-sm text-gray-900">Delivery Challan</span>
                  </label>
                </div>
                <button className="text-red-600 text-sm mt-1 hover:underline">
                  what's the difference?
                </button>
                <p className="text-xs text-gray-500 mt-1">* Required</p>
              </div>

              {/* Invoice Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  INVOICE DATE*
                </label>
                <div className="relative">
                  <input
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  />
                  <Calendar className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Customer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CUSTOMER*
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={currentSale.customerName || ''}
                    onChange={(e) => setCurrentSale(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Customer Name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none pr-12"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                </div>
                <input
                  type="tel"
                  value={currentSale.customerPhone || ''}
                  onChange={(e) => setCurrentSale(prev => ({ ...prev, customerPhone: e.target.value }))}
                  placeholder="Phone Number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none mt-2"
                />
                <button className="text-red-600 text-sm mt-1 hover:underline">
                  or add as 'Cash Sale'
                </button>
              </div>

              {/* Doctor & Follow-up */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  DOCTOR
                </label>
                <input
                  type="text"
                  value={currentSale.doctorName || ''}
                  onChange={(e) => setCurrentSale(prev => ({ ...prev, doctorName: e.target.value }))}
                  placeholder="Dr. Name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                />
                
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={currentSale.followUpDate ? currentSale.followUpDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setCurrentSale(prev => ({ ...prev, followUpDate: new Date(e.target.value) }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Entry */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-12 gap-4 items-end mb-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PRODUCT NAME*
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search Product Name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  />
                  <BarChart3 className="w-4 h-4 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">BATCH*</label>
                <input
                  type="text"
                  value={selectedProduct?.batch || ''}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">HSN*</label>
                <input
                  type="text"
                  value={selectedProduct?.hsnCode || ''}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PACK <Info className="w-3 h-3 inline text-gray-400" />
                </label>
                <input
                  type="text"
                  value={selectedProduct?.packUnits || ''}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">EXPIRY*</label>
                <input
                  type="text"
                  value={selectedProduct ? selectedProduct.expiryDate.toLocaleDateString('en-GB', { month: '2-digit', year: '2-digit' }) : ''}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">MRP*</label>
                <input
                  type="text"
                  value={selectedProduct ? `₹${selectedProduct.mrp}` : ''}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-red-600">PACKS</label>
                <input
                  type="number"
                  min="1"
                  defaultValue="1"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-red-50"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">LOOSE</label>
                <input
                  type="number"
                  min="0"
                  defaultValue="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">SALE RATE*</label>
                <input
                  type="text"
                  value={selectedProduct ? `₹${selectedProduct.price}` : ''}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">DISC %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  defaultValue="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">GST %*</label>
                <input
                  type="text"
                  value="12%"
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">AMOUNT</label>
                <button
                  onClick={() => selectedProduct && addItemToSale(selectedProduct)}
                  disabled={!selectedProduct}
                  className="w-full p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ADD
                </button>
              </div>
            </div>

            {/* Product Search Results */}
            {productSearch && productSuggestions.length > 0 && (
              <div className="mb-4 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                {productSuggestions.map(product => (
                  <div
                    key={product.id}
                    onClick={() => {
                      setSelectedProduct(product);
                      setProductSearch(product.name);
                    }}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.composition}</p>
                        <p className="text-xs text-gray-500">
                          Batch: {product.batch} | Stock: {product.stock} | MRP: ₹{product.mrp}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₹{product.price}</p>
                        <p className="text-xs text-gray-500">{product.packUnits}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* FIFO Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">Last in, First Out</span>
                <div className="relative inline-block w-12 h-6">
                  <input type="checkbox" className="sr-only" defaultChecked />
                  <div className="block bg-red-600 w-12 h-6 rounded-full"></div>
                  <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform translate-x-6"></div>
                </div>
                <span className="text-sm font-medium text-gray-900">First In, First Out</span>
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-medium">Shift + Tab</span> - Jump to Previous field
                <span className="ml-4 font-medium">Enter (↵)</span> - Jump to Next field
              </div>
            </div>
          </div>

          {/* Frequently Sold Products */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-red-600 font-medium mb-4">Frequently sold products</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-600 border-b border-gray-200">
                    <th className="pb-2">PRODUCT</th>
                    <th className="pb-2">LAST SOLD</th>
                    <th className="pb-2">QTY</th>
                    <th className="pb-2">MRP</th>
                    <th className="pb-2">SALE RATE</th>
                    <th className="pb-2">DISC %</th>
                  </tr>
                </thead>
                <tbody>
                  {frequentlyBought.map((product, index) => (
                    <tr
                      key={product.id}
                      onClick={() => addItemToSale(product)}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="py-3">
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.manufacturer}</p>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-gray-600">25/12/2022</td>
                      <td className="py-3 text-sm text-gray-600">24 packs</td>
                      <td className="py-3 text-sm text-gray-600">₹ {product.mrp.toLocaleString()}</td>
                      <td className="py-3 text-sm text-gray-600">₹ {product.price.toLocaleString()}</td>
                      <td className="py-3 text-sm text-gray-600">12.36%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sale Items Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Sale Items</h3>
              <div className="text-sm text-gray-500">
                {currentSale.items?.length || 0} items added
              </div>
            </div>
            
            {currentSale.items && currentSale.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-600 border-b border-gray-200">
                      <th className="pb-3 px-2">S.COUNT</th>
                      <th className="pb-3 px-2">PRODUCT</th>
                      <th className="pb-3 px-2">BATCH</th>
                      <th className="pb-3 px-2">HSN</th>
                      <th className="pb-3 px-2">PACK</th>
                      <th className="pb-3 px-2">EXPIRY</th>
                      <th className="pb-3 px-2">QTY</th>
                      <th className="pb-3 px-2">MRP</th>
                      <th className="pb-3 px-2">RATE</th>
                      <th className="pb-3 px-2">DISC %</th>
                      <th className="pb-3 px-2">GST %</th>
                      <th className="pb-3 px-2">AMOUNT</th>
                      <th className="pb-3 px-2">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSale.items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-2 text-sm text-gray-900">{index + 1}</td>
                        <td className="py-3 px-2">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{item.productName}</p>
                            <p className="text-xs text-blue-600">Stock available</p>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-600">{item.batch}</td>
                        <td className="py-3 px-2 text-sm text-gray-600">{item.hsnCode}</td>
                        <td className="py-3 px-2 text-sm text-gray-600">{item.packUnits}</td>
                        <td className="py-3 px-2 text-sm text-gray-600">
                          {item.expiryDate.toLocaleDateString('en-GB', { month: '2-digit', year: '2-digit' })}
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                            className="w-16 p-1 border border-gray-300 rounded text-center text-sm"
                          />
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-600">₹{item.price}</td>
                        <td className="py-3 px-2 text-sm text-gray-600">₹{item.price}</td>
                        <td className="py-3 px-2 text-sm text-gray-600">{item.discount}%</td>
                        <td className="py-3 px-2 text-sm text-gray-600">{item.cgst + item.sgst}%</td>
                        <td className="py-3 px-2 text-sm font-semibold text-gray-900">₹{item.total.toFixed(2)}</td>
                        <td className="py-3 px-2">
                          <button
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Remove item"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">No items added yet</p>
                <p className="text-sm">Search and add products to start building the sale</p>
              </div>
            )}
          </div>

          {/* Follow-up Notes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Follow-up Notes</h3>
            <textarea
              value={currentSale.followUpNotes || ''}
              onChange={(e) => setCurrentSale(prev => ({ ...prev, followUpNotes: e.target.value }))}
              placeholder="Add notes for follow-up (e.g., remind about refill, check on medication effectiveness, etc.)"
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            />
          </div>
        </div>

        {/* Fixed Bottom Summary Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          {/* Top section with controls */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <span className="text-sm text-gray-600">
                  <span className="font-medium">Alt + X</span> - Press to End List
                </span>
                
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 font-medium">BILL DISCOUNT</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={currentSale.discount || 0}
                      onChange={(e) => setCurrentSale(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                      className="w-20 p-2 border border-gray-300 rounded text-center text-sm"
                    />
                    <span className="text-sm text-gray-600">%</span>
                    <span className="text-sm text-gray-600">OR</span>
                    <span className="text-sm text-gray-600 font-medium">₹ {discountAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 font-medium">AMOUNT</span>
                  <span className="text-lg font-bold text-gray-900">₹ {totalAmount.toLocaleString()}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 font-medium">PAID VIA</span>
                  <select
                    value={currentSale.paymentMethod}
                    onChange={(e) => setCurrentSale(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="p-2 border border-gray-300 rounded text-sm"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="online">Online</option>
                  </select>
                </div>

                <input
                  type="text"
                  placeholder="Reference #"
                  className="p-2 border border-gray-300 rounded text-sm w-32"
                />
              </div>
            </div>
          </div>

          {/* Bottom summary bar */}
          <div className="bg-red-600 text-white px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <div className="text-sm opacity-90">Total Products:</div>
                  <div className="font-bold text-lg">{currentSale.items?.length || 0}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm opacity-90">Total Quantity:</div>
                  <div className="font-bold text-lg">{totalQuantity}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm opacity-90">(-) GST Amount</div>
                  <div className="font-bold text-lg">₹ {gstAmount.toLocaleString()}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm opacity-90">Total Amount</div>
                  <div className="font-bold text-lg">₹ {totalAmount.toLocaleString()}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm opacity-90">Net Profit</div>
                  <div className="font-bold text-lg">₹ {(totalAmount * 0.2).toLocaleString()}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm opacity-90">Amount Paid</div>
                  <div className="font-bold text-lg">₹ {totalAmount.toLocaleString()}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm opacity-90">Balance Due</div>
                  <div className="font-bold text-lg">₹ 0</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Sales Management</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
            onClick={() => setShowNewSale(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Sale</span>
          </button>
          
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search sales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex">
          <button
            onClick={() => setViewMode('customer')}
            className={`px-6 py-4 text-sm font-medium border-b-2 ${
              viewMode === 'customer' 
                ? 'text-red-600 border-red-600' 
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            By Customer
          </button>
          <button
            onClick={() => setViewMode('sales')}
            className={`px-6 py-4 text-sm font-medium border-b-2 ${
              viewMode === 'sales' 
                ? 'text-red-600 border-red-600' 
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            <Receipt className="w-4 h-4 inline mr-2" />
            All Sales
          </button>
        </div>
      </div>

      {/* Sales Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          {viewMode === 'customer' ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Sales
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Sale
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(groupedSales as any[]).map((group, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                          <Users className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{group.customerName}</div>
                          <div className="text-sm text-gray-500">{group.customerPhone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {group.sales.length} sales
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{group.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(group.lastSaleDate, 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            // Show individual sales for this customer
                            console.log('Show sales for:', group.customerName);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {group.customerPhone && (
                          <button
                            onClick={() => window.open(`tel:${group.customerPhone}`)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Phone className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bill No.
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
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
                {(groupedSales as Sale[]).map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {sale.billNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{sale.customerName}</div>
                        <div className="text-sm text-gray-500">{sale.customerPhone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.items.length} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{sale.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        sale.paymentMethod === 'cash' ? 'bg-green-100 text-green-800' :
                        sale.paymentMethod === 'card' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {sale.paymentMethod.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(sale.createdAt, 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedSale(sale)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePrintBill(sale, 'A4')}
                          className="text-green-600 hover:text-green-900"
                          title="Print Bill"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesManagement;

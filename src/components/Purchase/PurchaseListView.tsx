import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Eye, 
  Calendar, 
  Building2, 
  Phone, 
  MapPin, 
  FileText, 
  ArrowUpRight, 
  Filter,
  Download,
  Edit,
  Trash2
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { Purchase, Vendor } from '../../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface PurchaseListViewProps {
  purchases?: Purchase[];
  vendors?: Vendor[];
  onAddPurchase: () => void;
  onViewPurchase: (purchase: Purchase) => void;
  onEditPurchase: (purchase: Purchase) => void;
  onDeletePurchase: (purchaseId: string) => void;
}

const PurchaseListView: React.FC<PurchaseListViewProps> = ({
  purchases: initialPurchases,
  vendors,
  onAddPurchase,
  onViewPurchase,
  onEditPurchase,
  onDeletePurchase
}) => {
  const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases || []);
  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const { data: purchaseData, error: purchaseError } = await supabase
          .from('purchases')
          .select(`
            *,
            vendors (name, contact_person, phone, address, gst_number, drug_license),
            products (name, generic_name, manufacturer)
          `)
          .order('invoice_date', { ascending: false });

        if (purchaseError) throw purchaseError;
        if (purchaseData) setPurchases(purchaseData);
      } catch (error) {
        console.error('Error fetching purchases:', error);
        toast.error('Failed to load purchases');
      }
    };

    fetchPurchases();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [filterBy, setFilterBy] = useState<'distributor' | 'date'>('distributor');
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });

  // Filter purchases based on search and filters
  const handleDateRangeChange = (from: string, to: string) => {
    setDateRange({ from, to });
  };

  const filteredPurchases = useMemo(() => {
    return purchases.filter(purchase => {
      const matchesSearch = searchTerm === '' ||
        (purchase.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (purchase.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

      const matchesVendor = !selectedVendor || purchase.vendor_name === selectedVendor;

      const matchesDateRange = !dateRange.from || !dateRange.to ||
        (new Date(purchase.invoice_date) >= new Date(dateRange.from) &&
         new Date(purchase.invoice_date) <= new Date(dateRange.to));

      return matchesSearch && matchesVendor && matchesDateRange;
    });
  }, [purchases, searchTerm, selectedVendor, dateRange]);

  // Group purchases by vendor
  const purchasesByVendor = filteredPurchases.reduce((acc, purchase) => {
    const vendorName = purchase.vendor_name || 'Unknown';
    if (!acc[vendorName]) {
      acc[vendorName] = [];
    }
    acc[vendorName].push(purchase);
    return acc;
  }, {} as Record<string, Purchase[]>);

  // Calculate vendor statistics
  const getVendorStats = (vendorName: string) => {
    const vendorPurchases = purchasesByVendor[vendorName] || [];
    const totalAmount = vendorPurchases.reduce((sum, p) => sum + p.total_amount, 0);
    const outstandingAmount = vendorPurchases
      .filter(p => p.payment_status === 'pending')
      .reduce((sum, p) => sum + p.total_amount, 0);
    const lastPurchase = vendorPurchases.sort((a, b) => 
      new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    )[0];

    return {
      totalAmount,
      outstandingAmount,
      lastPurchase: lastPurchase?.created_at,
      purchaseCount: vendorPurchases.length
    };
  };

  // Filter vendors based on search
  const filteredVendors = Object.keys(purchasesByVendor).filter(vendorName =>
    vendorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: 'pending' | 'partial' | 'completed') => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVendorInitial = (vendorName: string) => {
    return vendorName.charAt(0).toUpperCase();
  };

  const getVendorColor = (vendorName: string) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
      'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'
    ];
    const index = vendorName.length % colors.length;
    return colors[index];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">View Purchase</h1>
          <div className="flex space-x-3">
            <button
              onClick={onAddPurchase}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Purchase (Alt + P)</span>
            </button>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
              <ArrowUpRight className="w-4 h-4" />
              <span>Purchase Return (Alt + R)</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Vendor List */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Filter Tabs */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setFilterBy('distributor')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  filterBy === 'distributor'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                By Distributor (56)
              </button>
              <button
                onClick={() => setFilterBy('date')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  filterBy === 'date'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                By Date
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Type here to search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
            </div>
          </div>

          {/* Vendor List */}
          <div className="flex-1 overflow-y-auto">
            {filteredVendors.map((vendorName) => {
              const stats = getVendorStats(vendorName);
              const isSelected = selectedVendor === vendorName;
              
              return (
                <div
                  key={vendorName}
                  onClick={() => setSelectedVendor(vendorName)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${getVendorColor(vendorName)}`}>
                      {getVendorInitial(vendorName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 truncate">{vendorName}</h3>
                        <span className="text-xs text-gray-500">Outstanding</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-600">
                          Last Purchase: {stats.lastPurchase ? format(new Date(stats.lastPurchase), 'dd MMM yyyy') : 'Never'}
                        </p>
                        <span className="text-sm font-semibold text-red-600">
                          ₹ {stats.outstandingAmount != null ? stats.outstandingAmount.toLocaleString() : '0'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Content - Purchase Details */}
        <div className="flex-1 flex flex-col">
          {selectedVendor ? (
            <>
              {/* Vendor Header */}
              <div className="bg-white border-b border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold ${getVendorColor(selectedVendor)}`}>
                      {getVendorInitial(selectedVendor)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedVendor}</h2>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>Ahmedabad</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Phone className="w-4 h-4" />
                          <span>Contact: 7000413345</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span>GSTIN: 24AQPPA137R1ZM</span>
                        <span>Drug Lic: 20B-AZ1/340148, 21B-AZ1/340149</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Outstanding</div>
                    <div className="text-3xl font-bold text-red-600">
                      ₹{getVendorStats(selectedVendor).outstandingAmount != null ? getVendorStats(selectedVendor).outstandingAmount.toLocaleString() : '0'}
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1 mt-2">
                      <span>Add Payment</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Purchase Tabs */}
              <div className="bg-white border-b border-gray-200 px-6">
                <div className="flex items-center space-x-8">
                  <button className="py-4 border-b-2 border-red-600 text-red-600 font-medium">
                    Purchases (256)
                  </button>
                  <button className="py-4 text-gray-600 hover:text-gray-900">
                    Returns (78)
                  </button>
                  <button className="py-4 text-gray-600 hover:text-gray-900">
                    Payments (78)
                  </button>
                  <div className="ml-auto flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Oct 27, 2020 - Nov 25, 2020</span>
                  </div>
                </div>
              </div>

              {/* Purchase Table */}
              <div className="flex-1 bg-white overflow-hidden">
                <div className="overflow-x-auto h-full">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invoice #
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Balance
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Due Date
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
                      {(purchasesByVendor[selectedVendor] || []).map((purchase) => (
                        <tr key={purchase.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {purchase.invoice_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {format(new Date(purchase.invoice_date), 'dd MMM yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ₹{purchase.total_amount != null ? purchase.total_amount.toLocaleString() : '0'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{purchase.payment_status === 'completed' ? '0' : (purchase.total_amount != null ? purchase.total_amount.toLocaleString() : '0')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {format(new Date(new Date(purchase.invoice_date).getTime() + 30 * 24 * 60 * 60 * 1000), 'dd MMM yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(purchase.payment_status)}`}>
                              {purchase.payment_status === 'completed' ? 'Paid' : 
                               purchase.payment_status === 'pending' ? 'Due' : 'Partial'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center justify-start space-x-2">
                                <button
                                  onClick={() => onViewPurchase(purchase)}
                                  className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-900"
                                >
                                  <Eye className="w-4 h-4" />
                                  <span>View</span>
                                </button>
                              </div>
                              <div className="flex items-center justify-start space-x-2">
                                <button
                                  onClick={() => onEditPurchase(purchase)}
                                  className="inline-flex items-center space-x-1 text-green-600 hover:text-green-900"
                                >
                                  <Edit className="w-4 h-4" />
                                  <span>Edit</span>
                                </button>
                              </div>
                              <div className="flex items-center justify-start space-x-2">
                                <button
                                  onClick={() => purchase.id ? onDeletePurchase(purchase.id) : undefined}
                                  className="inline-flex items-center space-x-1 text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="text-center">
                <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Vendor</h3>
                <p className="text-gray-500">Choose a vendor from the list to view their purchase history</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseListView;

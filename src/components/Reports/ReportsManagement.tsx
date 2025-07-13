import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building2,
  Truck,
  Receipt,
  Target,
  Zap,
  Eye,
  Settings,
  Search
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface ReportItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  category: string;
  frequency?: string;
  lastGenerated?: Date;
  status?: 'available' | 'generating' | 'scheduled';
}

const ReportsManagement: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    from: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd')
  });

  const reportCategories = [
    { id: 'all', name: 'All Reports', color: 'bg-gray-100 text-gray-800' },
    { id: 'sales', name: 'Sales Reports', color: 'bg-green-100 text-green-800' },
    { id: 'purchase', name: 'Purchase Reports', color: 'bg-blue-100 text-blue-800' },
    { id: 'inventory', name: 'Inventory Reports', color: 'bg-purple-100 text-purple-800' },
    { id: 'financial', name: 'Financial Reports', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'customer', name: 'Customer Reports', color: 'bg-pink-100 text-pink-800' },
    { id: 'compliance', name: 'Compliance Reports', color: 'bg-red-100 text-red-800' }
  ];

  const reports: ReportItem[] = [
    // Sales Reports
    {
      id: 'daily-sales',
      title: 'Daily Sales Report',
      description: 'Daily sales summary with product-wise breakdown',
      icon: TrendingUp,
      category: 'sales',
      frequency: 'Daily',
      lastGenerated: new Date(),
      status: 'available'
    },
    {
      id: 'monthly-sales',
      title: 'Monthly Sales Report',
      description: 'Comprehensive monthly sales analysis',
      icon: BarChart3,
      category: 'sales',
      frequency: 'Monthly',
      lastGenerated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'available'
    },
    {
      id: 'sales-by-customer',
      title: 'Sales by Customer',
      description: 'Customer-wise sales breakdown and analysis',
      icon: Users,
      category: 'sales',
      frequency: 'On-demand',
      status: 'available'
    },
    {
      id: 'sales-by-product',
      title: 'Sales by Product',
      description: 'Product-wise sales performance report',
      icon: Package,
      category: 'sales',
      frequency: 'Weekly',
      lastGenerated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'available'
    },
    {
      id: 'payment-methods',
      title: 'Payment Methods Report',
      description: 'Analysis of payment methods used by customers',
      icon: DollarSign,
      category: 'sales',
      frequency: 'Monthly',
      status: 'generating'
    },

    // Purchase Reports
    {
      id: 'purchase-summary',
      title: 'Purchase Summary',
      description: 'Summary of all purchases with vendor details',
      icon: ShoppingCart,
      category: 'purchase',
      frequency: 'Monthly',
      lastGenerated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: 'available'
    },
    {
      id: 'vendor-wise-purchase',
      title: 'Vendor-wise Purchase',
      description: 'Purchase analysis by vendor with outstanding amounts',
      icon: Building2,
      category: 'purchase',
      frequency: 'Weekly',
      lastGenerated: new Date(),
      status: 'available'
    },
    {
      id: 'purchase-returns',
      title: 'Purchase Returns',
      description: 'Analysis of returned items and reasons',
      icon: Truck,
      category: 'purchase',
      frequency: 'Monthly',
      status: 'scheduled'
    },
    {
      id: 'outstanding-payments',
      title: 'Outstanding Payments',
      description: 'Pending payments to vendors with due dates',
      icon: Clock,
      category: 'purchase',
      frequency: 'Weekly',
      lastGenerated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'available'
    },

    // Inventory Reports
    {
      id: 'stock-summary',
      title: 'Stock Summary',
      description: 'Current stock levels with low stock alerts',
      icon: Package,
      category: 'inventory',
      frequency: 'Daily',
      lastGenerated: new Date(),
      status: 'available'
    },
    {
      id: 'expiry-report',
      title: 'Expiry Report',
      description: 'Products nearing expiry or already expired',
      icon: AlertTriangle,
      category: 'inventory',
      frequency: 'Daily',
      lastGenerated: new Date(),
      status: 'available'
    },
    {
      id: 'batch-wise-stock',
      title: 'Batch-wise Stock',
      description: 'Stock analysis by batch numbers and expiry dates',
      icon: Receipt,
      category: 'inventory',
      frequency: 'Weekly',
      lastGenerated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'available'
    },
    {
      id: 'stock-movement',
      title: 'Stock Movement',
      description: 'Detailed stock in/out movements with reasons',
      icon: Activity,
      category: 'inventory',
      frequency: 'Monthly',
      status: 'generating'
    },
    {
      id: 'dead-stock',
      title: 'Dead Stock Analysis',
      description: 'Products with no movement for extended periods',
      icon: Target,
      category: 'inventory',
      frequency: 'Monthly',
      lastGenerated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'available'
    },

    // Financial Reports
    {
      id: 'profit-loss',
      title: 'Profit & Loss Statement',
      description: 'Comprehensive P&L with revenue and expense breakdown',
      icon: TrendingUp,
      category: 'financial',
      frequency: 'Monthly',
      lastGenerated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'available'
    },
    {
      id: 'cash-flow',
      title: 'Cash Flow Statement',
      description: 'Cash inflows and outflows analysis',
      icon: DollarSign,
      category: 'financial',
      frequency: 'Monthly',
      status: 'scheduled'
    },
    {
      id: 'gst-report',
      title: 'GST Report',
      description: 'GST collected and paid with detailed breakdown',
      icon: Receipt,
      category: 'financial',
      frequency: 'Monthly',
      lastGenerated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'available'
    },
    {
      id: 'margin-analysis',
      title: 'Margin Analysis',
      description: 'Product-wise margin analysis and profitability',
      icon: PieChart,
      category: 'financial',
      frequency: 'Weekly',
      lastGenerated: new Date(),
      status: 'available'
    },

    // Customer Reports
    {
      id: 'customer-analysis',
      title: 'Customer Analysis',
      description: 'Customer behavior and purchase pattern analysis',
      icon: Users,
      category: 'customer',
      frequency: 'Monthly',
      lastGenerated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: 'available'
    },
    {
      id: 'top-customers',
      title: 'Top Customers',
      description: 'Highest value customers by purchase amount',
      icon: Target,
      category: 'customer',
      frequency: 'Monthly',
      lastGenerated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'available'
    },
    {
      id: 'customer-credit',
      title: 'Customer Credit Report',
      description: 'Outstanding credit amounts from customers',
      icon: Clock,
      category: 'customer',
      frequency: 'Weekly',
      status: 'generating'
    },

    // Compliance Reports
    {
      id: 'drug-license',
      title: 'Drug License Compliance',
      description: 'Drug license status and renewal tracking',
      icon: CheckCircle,
      category: 'compliance',
      frequency: 'Monthly',
      lastGenerated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'available'
    },
    {
      id: 'schedule-drugs',
      title: 'Schedule Drugs Report',
      description: 'Schedule H and X drugs sales tracking',
      icon: AlertTriangle,
      category: 'compliance',
      frequency: 'Monthly',
      lastGenerated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'available'
    },
    {
      id: 'audit-trail',
      title: 'Audit Trail',
      description: 'Complete audit trail of all system activities',
      icon: Eye,
      category: 'compliance',
      frequency: 'On-demand',
      status: 'available'
    }
  ];

  const filteredReports = reports.filter(report => {
    const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory;
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleGenerateReport = (reportId: string) => {
    toast.success('Report generation started. You will be notified when ready.');
    // Here you would typically trigger the report generation API
  };

  const handleDownloadReport = (reportId: string) => {
    toast.success('Report downloaded successfully');
    // Here you would typically trigger the download
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'generating':
        return <Clock className="w-4 h-4 text-yellow-600 animate-spin" />;
      case 'scheduled':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'available':
        return 'Ready';
      case 'generating':
        return 'Generating...';
      case 'scheduled':
        return 'Scheduled';
      default:
        return 'Available';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Business Reports</h1>
          <p className="text-gray-600">Generate and download comprehensive business reports</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto mt-4 lg:mt-0">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Report Settings</span>
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Schedule Reports</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Date Range */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Date Range:</span>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          {reportCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : category.color
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map(report => {
          const Icon = report.icon;
          return (
            <div key={report.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{report.title}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(report.status)}
                      <span className="text-xs text-gray-500">{getStatusText(report.status)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4">{report.description}</p>

              {/* Metadata */}
              <div className="space-y-2 mb-4">
                {report.frequency && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Frequency:</span>
                    <span className="font-medium text-gray-700">{report.frequency}</span>
                  </div>
                )}
                {report.lastGenerated && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Last Generated:</span>
                    <span className="font-medium text-gray-700">
                      {format(report.lastGenerated, 'dd/MM/yyyy HH:mm')}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                {report.status === 'available' ? (
                  <>
                    <button
                      onClick={() => handleDownloadReport(report.id)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                    <button
                      onClick={() => handleGenerateReport(report.id)}
                      className="px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                  </>
                ) : report.status === 'generating' ? (
                  <button
                    disabled
                    className="flex-1 bg-gray-400 text-white px-3 py-2 rounded text-sm cursor-not-allowed flex items-center justify-center space-x-1"
                  >
                    <Clock className="w-3 h-3 animate-spin" />
                    <span>Generating...</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleGenerateReport(report.id)}
                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors flex items-center justify-center space-x-1"
                  >
                    <FileText className="w-3 h-3" />
                    <span>Generate</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ready to Download</p>
              <p className="text-2xl font-bold text-green-600">
                {reports.filter(r => r.status === 'available').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Generating</p>
              <p className="text-2xl font-bold text-yellow-600">
                {reports.filter(r => r.status === 'generating').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-blue-600">
                {reports.filter(r => r.status === 'scheduled').length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsManagement;

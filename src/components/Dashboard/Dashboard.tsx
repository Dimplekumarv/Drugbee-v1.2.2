import React, { useState } from 'react';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Users, 
  AlertTriangle,
  DollarSign,
  Calendar,
  Activity,
  Eye,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  CreditCard,
  Banknote,
  Smartphone,
  Building2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';
import { format, subDays } from 'date-fns';
import { mockSales, mockOrders } from '../../data/mockData';
import toast from 'react-hot-toast';

interface FollowUpCustomer {
  id: string;
  customerName: string;
  phone: string;
  followUpDate: Date;
  medicines: string[];
  lastPurchaseDate: Date;
  totalAmount: number;
  status: 'pending' | 'contacted' | 'completed';
}

const Dashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [showFollowUpDetails, setShowFollowUpDetails] = useState<string | null>(null);

  // Analytics data based on the image
  const analyticsData = {
    netSales: {
      current: 2624990,
      previous: 2624990,
      change: 11.3,
      trend: 'up'
    },
    stockValue: {
      purchaseRate: 2624990,
      mrp: 2624990,
      saleRate: 2624990
    },
    customers: {
      total: 2624,
      avgOrderValue: 490.5,
      new: 1312,
      repeat: 1312,
      change: 11.3
    },
    netPurchase: {
      current: 2624990,
      previous: 2624990,
      change: -11.3,
      trend: 'down'
    },
    cashInHand: {
      total: 2624990,
      cash: { amount: 224990, percentage: 79.7 },
      online: { amount: 74990, percentage: 34.7 },
      cheque: { amount: 22990, percentage: 12.7 },
      totalPaymentIn: 2624990,
      totalPaymentOut: 2624990,
      expenses: 2624990
    },
    netProfit: {
      current: 2624990,
      previous: 2624990,
      change: -11.3,
      trend: 'down'
    }
  };

  const salesData = [
    { name: 'Oct 29', sales: 4000, purchase: 3500, profit: 500 },
    { name: 'Nov 3', sales: 3000, purchase: 2800, profit: 200 },
    { name: 'Nov 7', sales: 5000, purchase: 4200, profit: 800 },
    { name: 'Nov 11', sales: 4500, purchase: 3900, profit: 600 },
    { name: 'Nov 15', sales: 6000, purchase: 5100, profit: 900 },
    { name: 'Nov 21', sales: 5500, purchase: 4800, profit: 700 },
    { name: 'Nov 27', sales: 4000, purchase: 3600, profit: 400 }
  ];

  const customerData = [
    { name: 'New', value: 1312, color: '#EF4444' },
    { name: 'Repeat', value: 1312, color: '#9CA3AF' }
  ];

  const paymentMethodData = [
    { name: 'Cash', value: 79.7, amount: 224990, color: '#EF4444' },
    { name: 'Online', value: 34.7, amount: 74990, color: '#3B82F6' },
    { name: 'Cheque', value: 12.7, amount: 22990, color: '#10B981' }
  ];

  // Recent orders from mock data
  const recentOrders = mockOrders.slice(0, 5).map(order => ({
    ...order,
    timeAgo: format(order.createdAt, 'MMM dd, yyyy')
  }));

  // Follow-up customers (simulated data based on sales)
  const followUpCustomers: FollowUpCustomer[] = [
    {
      id: '1',
      customerName: 'Rajesh Kumar',
      phone: '+91-9876543210',
      followUpDate: new Date(),
      medicines: ['Crocin 650mg', 'Amoxicillin 500mg', 'Cetirizine 10mg'],
      lastPurchaseDate: subDays(new Date(), 30),
      totalAmount: 450,
      status: 'pending'
    },
    {
      id: '2',
      customerName: 'Priya Sharma',
      phone: '+91-9876543211',
      followUpDate: subDays(new Date(), 1),
      medicines: ['Paracetamol 500mg', 'Omeprazole 20mg'],
      lastPurchaseDate: subDays(new Date(), 25),
      totalAmount: 320,
      status: 'contacted'
    },
    {
      id: '3',
      customerName: 'Amit Patel',
      phone: '+91-9876543212',
      followUpDate: subDays(new Date(), 2),
      medicines: ['Metformin 500mg', 'Atorvastatin 10mg', 'Amlodipine 5mg'],
      lastPurchaseDate: subDays(new Date(), 28),
      totalAmount: 680,
      status: 'pending'
    },
    {
      id: '4',
      customerName: 'Sunita Devi',
      phone: '+91-9876543213',
      followUpDate: new Date(),
      medicines: ['Insulin Glargine', 'Glucometer Strips'],
      lastPurchaseDate: subDays(new Date(), 30),
      totalAmount: 1250,
      status: 'pending'
    }
  ];

  const slowMovingProducts = [
    { name: 'AZEE 100MG DRY 15ML SYP', company: 'CIPLA', qty: '15 units', location: 'A10 BOX', lastSold: '25/12/2020' },
    { name: 'FEBREX PLUS 15ML ORAL DROPS', company: 'FDC', qty: '10 units', location: 'A10 BOX', lastSold: '25/12/2020' },
    { name: 'IBUGESIC PLUS 60ML SYP', company: 'PROCTER', qty: '7 units', location: 'A10 BOX', lastSold: '25/12/2020' },
    { name: 'AZEE 100MG DRY 15ML SYP', company: 'CIPLA', qty: '2 units', location: 'A10 BOX', lastSold: '25/12/2020' }
  ];

  const handleFollowUpCall = (customerId: string) => {
    const customer = followUpCustomers.find(c => c.id === customerId);
    if (customer) {
      window.open(`tel:${customer.phone}`);
      toast.success(`Calling ${customer.customerName}...`);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹ ${(amount / 100000).toFixed(1)}L`;
  };

  const formatChange = (change: number, trend: string) => {
    const icon = trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />;
    const color = trend === 'up' ? 'text-green-600' : 'text-red-600';
    return (
      <div className={`flex items-center space-x-1 ${color}`}>
        {icon}
        <span className="text-sm font-medium">{Math.abs(change)}%</span>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medicare Plus Medical and General Stores</h1>
          <div className="flex items-center space-x-2 mt-1">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Oct 27, 2020 - Nov 25, 2020</span>
          </div>
        </div>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
          <option value="90days">Last 90 days</option>
        </select>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Net Sales */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">Net Sales</h3>
              <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-600">?</span>
              </div>
            </div>
            {formatChange(analyticsData.netSales.change, analyticsData.netSales.trend)}
          </div>
          
          <div className="mb-4">
            <div className="text-3xl font-bold text-gray-900">{formatCurrency(analyticsData.netSales.current)}</div>
            <div className="text-sm text-gray-500">from {formatCurrency(analyticsData.netSales.previous)}</div>
          </div>

          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Value */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Stock Value</h3>
            <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-xs text-gray-600">?</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600">Purchase Rate (excl gst)</div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.stockValue.purchaseRate)}</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600">MRP (incl gst)</div>
              <div className="text-xl font-semibold text-gray-900">{formatCurrency(analyticsData.stockValue.mrp)}</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600">Sale Rate (incl gst)</div>
              <div className="text-xl font-semibold text-gray-900">{formatCurrency(analyticsData.stockValue.saleRate)}</div>
            </div>
          </div>
        </div>

        {/* Customers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">Customers</h3>
              <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-600">?</span>
              </div>
            </div>
            {formatChange(analyticsData.customers.change, 'up')}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-600">Total Customers</div>
              <div className="text-2xl font-bold text-gray-900">{analyticsData.customers.total.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Avg Order Value</div>
              <div className="text-2xl font-bold text-gray-900">₹ {analyticsData.customers.avgOrderValue}</div>
            </div>
          </div>

          <div className="flex items-center justify-center mb-4">
            <div className="relative w-24 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={customerData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={40}
                    dataKey="value"
                  >
                    {customerData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-600">New Customers</span>
              </div>
              <span className="font-semibold text-gray-900">{analyticsData.customers.new.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span className="text-sm text-gray-600">Repeat Customers</span>
              </div>
              <span className="font-semibold text-gray-900">{analyticsData.customers.repeat.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Net Purchase */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">Net Purchase</h3>
              <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-600">?</span>
              </div>
            </div>
            {formatChange(analyticsData.netPurchase.change, analyticsData.netPurchase.trend)}
          </div>
          
          <div className="mb-4">
            <div className="text-3xl font-bold text-gray-900">{formatCurrency(analyticsData.netPurchase.current)}</div>
            <div className="text-sm text-gray-500">from {formatCurrency(analyticsData.netPurchase.previous)}</div>
          </div>

          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <Line 
                  type="monotone" 
                  dataKey="purchase" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cash-in-Hand */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">Cash-in-Hand</h3>
              <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-600">?</span>
              </div>
            </div>
            <button className="text-red-600 text-sm font-medium hover:underline">
              Add Opening Balance
            </button>
          </div>
          
          <div className="mb-4">
            <div className="text-3xl font-bold text-gray-900">{formatCurrency(analyticsData.cashInHand.total)}</div>
            <div className="text-sm text-gray-500">from {formatCurrency(analyticsData.cashInHand.total)}</div>
          </div>

          <div className="space-y-3">
            {paymentMethodData.map((method, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: method.color }}></div>
                  <span className="text-sm text-gray-600 uppercase">{method.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">₹ {(method.amount / 1000).toFixed(0)}K</div>
                  <div className="text-xs text-gray-500">{method.value}%</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Payment In</span>
              <span className="font-medium">{formatCurrency(analyticsData.cashInHand.totalPaymentIn)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Payment Out</span>
              <span className="font-medium">{formatCurrency(analyticsData.cashInHand.totalPaymentOut)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Expenses (excl gst)</span>
              <span className="font-medium">{formatCurrency(analyticsData.cashInHand.expenses)}</span>
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">Net Profit</h3>
              <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-600">?</span>
              </div>
            </div>
            {formatChange(analyticsData.netProfit.change, analyticsData.netProfit.trend)}
          </div>
          
          <div className="mb-4">
            <div className="text-3xl font-bold text-gray-900">{formatCurrency(analyticsData.netProfit.current)}</div>
            <div className="text-sm text-gray-500">from {formatCurrency(analyticsData.netProfit.previous)}</div>
          </div>

          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders and Follow-up Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <ShoppingCart className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">{order.customerName}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'approved' ? 'bg-green-100 text-green-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{order.customerPhone} • {order.timeAgo}</p>
                  <p className="text-sm text-gray-600">{order.items.length} items</p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-semibold text-gray-900">₹{order.total.toFixed(2)}</p>
                  <button className="text-blue-600 text-sm hover:underline flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>View</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Follow-up Customers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Follow-up Customers</h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {followUpCustomers.map((customer) => (
              <div key={customer.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900">{customer.customerName}</p>
                    <p className="text-sm text-gray-500">{customer.phone}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      customer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      customer.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {customer.status}
                    </span>
                    <button
                      onClick={() => handleFollowUpCall(customer.id)}
                      className="p-1 text-green-600 hover:bg-green-100 rounded"
                      title="Call Customer"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Follow-up: {format(customer.followUpDate, 'dd/MM/yyyy')}</span>
                  <span>Last Purchase: ₹{customer.totalAmount}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowFollowUpDetails(showFollowUpDetails === customer.id ? null : customer.id)}
                    className="text-blue-600 text-sm hover:underline flex items-center space-x-1"
                  >
                    <Package className="w-3 h-3" />
                    <span>{customer.medicines.length} medicines</span>
                  </button>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{format(customer.lastPurchaseDate, 'dd/MM/yyyy')}</span>
                  </div>
                </div>
                
                {showFollowUpDetails === customer.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Medicines:</p>
                    <div className="space-y-1">
                      {customer.medicines.map((medicine, index) => (
                        <div key={index} className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {medicine}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slow Moving Products */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Slow Moving</h3>
            <div className="flex space-x-6 mt-2">
              <button className="text-sm text-gray-900 border-b-2 border-gray-900 pb-1">Slow Moving</button>
              <button className="text-sm text-gray-500 hover:text-gray-700">Expired</button>
              <button className="text-sm text-gray-500 hover:text-gray-700">Expiring</button>
            </div>
          </div>
          <AlertTriangle className="w-5 h-5 text-orange-500" />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-600 border-b border-gray-200">
                <th className="pb-3">PRODUCT NAME</th>
                <th className="pb-3">COMPANY</th>
                <th className="pb-3">QTY</th>
                <th className="pb-3">LOCATION</th>
                <th className="pb-3">LAST SOLD</th>
              </tr>
            </thead>
            <tbody>
              {slowMovingProducts.map((product, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="py-3 text-sm text-gray-600">{product.company}</td>
                  <td className="py-3 text-sm text-gray-600">{product.qty}</td>
                  <td className="py-3 text-sm text-gray-600">{product.location}</td>
                  <td className="py-3 text-sm text-gray-600">{product.lastSold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

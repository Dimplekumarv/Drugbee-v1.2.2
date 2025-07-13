import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Package,
  Phone,
  MapPin,
  FileText,
  Globe,
  RefreshCw
} from 'lucide-react';
import { mockOrders } from '../../data/mockData';
import { Order } from '../../types';
import toast from 'react-hot-toast';

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState('all');

  // Load online store orders on component mount
  useEffect(() => {
    const loadOnlineOrders = () => {
      const onlineOrders = JSON.parse(localStorage.getItem('onlineStoreOrders') || '[]');
      if (onlineOrders.length > 0) {
        setOrders(prev => [...prev, ...onlineOrders]);
        // Clear the online orders from localStorage after loading
        localStorage.removeItem('onlineStoreOrders');
      }
    };

    loadOnlineOrders();
    
    // Set up interval to check for new online orders
    const interval = setInterval(loadOnlineOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderSource = (order: Order) => {
    return order.customerId === 'online-customer' ? 'Online Store' : 'In-Store';
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus, updatedAt: new Date() }
        : order
    ));
    toast.success(`Order ${newStatus} successfully`);
    setSelectedOrder(null);
  };

  const handleRefreshOrders = () => {
    const onlineOrders = JSON.parse(localStorage.getItem('onlineStoreOrders') || '[]');
    if (onlineOrders.length > 0) {
      setOrders(prev => [...prev, ...onlineOrders]);
      localStorage.removeItem('onlineStoreOrders');
      toast.success(`${onlineOrders.length} new orders loaded from online store`);
    } else {
      toast.info('No new orders found');
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'online') return order.customerId === 'online-customer';
    if (filter === 'in-store') return order.customerId !== 'online-customer';
    return order.status === filter;
  });

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Management</h1>
          <p className="text-gray-600">Manage orders from both online store and in-store sales</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4 sm:mt-0">
          <button
            onClick={handleRefreshOrders}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Orders</span>
          </button>
          
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search orders..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="all">All Orders</option>
            <option value="online">Online Store</option>
            <option value="in-store">In-Store</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                      <div className="text-sm text-gray-500">{order.customerPhone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getOrderSource(order) === 'Online Store' ? (
                        <Globe className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Package className="w-4 h-4 text-green-600" />
                      )}
                      <span className="text-sm text-gray-900">{getOrderSource(order)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.items.length} items
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'approved')}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                          className="text-red-600 hover:text-red-900"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Order Source Badge */}
                <div className="flex items-center space-x-2">
                  {getOrderSource(selectedOrder) === 'Online Store' ? (
                    <Globe className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Package className="w-5 h-5 text-green-600" />
                  )}
                  <span className="font-medium text-gray-900">{getOrderSource(selectedOrder)}</span>
                </div>

                {/* Customer Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Name: {selectedOrder.customerName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Phone: {selectedOrder.customerPhone}</span>
                    </div>
                    <div className="flex items-start space-x-2 md:col-span-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="text-sm text-gray-600">Address: {selectedOrder.deliveryAddress}</span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-gray-900">₹{item.total.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">₹{selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Charge:</span>
                      <span className="font-medium">₹{selectedOrder.deliveryCharge.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>₹{selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedOrder.status === 'pending' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleStatusUpdate(selectedOrder.id, 'approved')}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Approve Order
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedOrder.id, 'cancelled')}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
                
                {selectedOrder.status === 'approved' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'processing')}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Mark as Processing
                  </button>
                )}
                
                {selectedOrder.status === 'processing' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'shipped')}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Mark as Shipped
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;

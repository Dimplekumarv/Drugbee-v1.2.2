import React from 'react';
import { 
  Home, 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  FileText, 
  Settings,
  LogOut,
  Shield,
  Package2,
  Store,
  Globe
} from 'lucide-react';
import { User } from '../../types';
import { hasPermission } from '../../utils/auth';

interface SidebarProps {
  user: User | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, activeTab, onTabChange, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, requiredPermission: null },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, requiredPermission: 'orders' },
    { id: 'sales', label: 'Sales', icon: TrendingUp, requiredPermission: 'sales' },
    { id: 'purchase', label: 'Purchase', icon: Package, requiredPermission: 'purchase' },
    { id: 'inventory', label: 'Inventory', icon: Package2, requiredPermission: 'inventory' },
    { id: 'products', label: 'Products', icon: Package, requiredPermission: 'inventory' },
    { id: 'online-products', label: 'Store Products', icon: Globe, requiredPermission: 'inventory' },
    { id: 'reports', label: 'Reports', icon: FileText, requiredPermission: null },
    { id: 'team', label: 'Team Management', icon: Users, requiredPermission: null, adminOnly: true },
    { id: 'settings', label: 'Settings', icon: Settings, requiredPermission: null }
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (item.adminOnly && user?.role !== 'admin') return false;
    if (item.requiredPermission && !hasPermission(user, item.requiredPermission)) return false;
    return true;
  });

  const handleOnlineStoreClick = () => {
    // Open online store in new tab
    window.open('/online-store', '_blank');
  };

  return (
    <div className="bg-white shadow-lg h-full w-64 fixed left-0 top-0 z-30 flex flex-col">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800">Drug Bee</h1>
        </div>
        
        <div className="mb-6">
          <div className="text-sm text-gray-600">Welcome back,</div>
          <div className="font-semibold text-gray-800">{user?.name}</div>
          <div className="text-xs text-blue-600 capitalize">{user?.role}</div>
        </div>
      </div>

      <nav className="px-4 flex-1 overflow-y-auto">
        {/* Online Store Button */}
        <div className="mb-4">
          <button
            onClick={handleOnlineStoreClick}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-colors bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-sm"
          >
            <Store className="w-5 h-5" />
            <span className="font-medium">Online Store</span>
          </button>
          <div className="border-b border-gray-200 mb-4"></div>
        </div>

        {/* Regular Menu Items */}
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

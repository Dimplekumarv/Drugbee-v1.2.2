import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Admin Components
import LoginForm from './components/Auth/LoginForm';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import OrderManagement from './components/Orders/OrderManagement';
import SalesManagement from './components/Sales/SalesManagement';
import PurchaseManagement from './components/Purchase/PurchaseManagement';
import ProductManagement from './components/Products/ProductManagement';
import OnlineStoreProductManagement from './components/Products/OnlineStoreProductManagement';
import StockManagement from './components/Inventory/StockManagement';
import ReportsManagement from './components/Reports/ReportsManagement';
import SettingsManagement from './components/Settings/SettingsManagement';

// Online Store Components
import OnlineStoreApp from './components/OnlineStore/OnlineStoreApp';

// Utils
import { getCurrentUser, logout } from './utils/auth';
import { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const isOnlineStore = location.pathname.startsWith('/online-store');

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogin = () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setActiveTab('dashboard');
  };

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Dashboard';
      case 'orders': return 'Order Management';
      case 'sales': return 'Sales Management';
      case 'purchase': return 'Purchase Management';
      case 'inventory': return 'Stock Management';
      case 'products': return 'Product Catalog';
      case 'online-products': return 'Online Store Products';
      case 'reports': return 'Reports & Analytics';
      case 'team': return 'Team Management';
      case 'settings': return 'Settings';
      default: return 'PharmaCare';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'orders':
        return <OrderManagement />;
      case 'sales':
        return <SalesManagement />;
      case 'purchase':
        return <PurchaseManagement />;
      case 'inventory':
        return <StockManagement />;
      case 'products':
        return <ProductManagement />;
      case 'online-products':
        return <OnlineStoreProductManagement />;
      case 'reports':
        return <ReportsManagement />;
      case 'settings':
        return <SettingsManagement />;
      case 'team':
        return <div className="p-6"><h1 className="text-2xl font-bold">Team Management</h1><p className="text-gray-600 mt-2">Team management features coming soon...</p></div>;
      default:
        return <Dashboard />;
    }
  };

  // Show online store if URL starts with /online-store
  if (isOnlineStore) {
    return (
      <>
        <OnlineStoreApp />
      </>
    );
  }

  // Show admin login if no user
  if (!user) {
    return (
      <>
        <LoginForm onLogin={handleLogin} />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#333',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            },
          }}
        />
      </>
    );
  }

  // Show admin dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />
      
      <div className="ml-64">
        <Header 
          title={getTabTitle(activeTab)}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <main className="pt-16">
          {renderContent()}
        </main>
      </div>

      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          },
        }}
      />
    </div>
  );
}

export default App;
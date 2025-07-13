import React from 'react';
import { Home, Store, ShoppingCart, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface BottomNavigationProps {
  cartItemCount: number;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ cartItemCount }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/online-store',
      emoji: '🏠'
    },
    {
      id: 'store',
      label: 'Store',
      icon: Store,
      path: '/online-store/store',
      emoji: '🛒'
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: ShoppingCart,
      path: '/online-store/cart',
      emoji: '🧾',
      badge: cartItemCount
    },
    {
      id: 'account',
      label: 'Account',
      icon: User,
      path: '/online-store/account',
      emoji: '👤'
    }
  ];

  const isActive = (path: string) => {
    if (path === '/online-store') {
      return location.pathname === '/online-store';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="grid grid-cols-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center py-2 px-1 transition-colors ${
                active
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="relative">
                <div className="text-lg mb-1">{item.emoji}</div>
                {item.badge && item.badge > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {item.badge > 99 ? '99+' : item.badge}
                  </div>
                )}
              </div>
              <span className={`text-xs font-medium ${active ? 'text-blue-600' : 'text-gray-600'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;

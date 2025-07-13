import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuToggle }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 fixed top-0 left-64 right-0 z-20">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button className="relative p-2 text-gray-400 hover:text-gray-600">
            <Bell className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

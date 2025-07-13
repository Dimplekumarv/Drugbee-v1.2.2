import React, { useState } from 'react';
import { MapPin, Search, Bell, Menu } from 'lucide-react';

interface Address {
  id: string;
  label: string;
  address: string;
  isDefault: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: Address[];
}

interface TopBarProps {
  selectedAddress: Address | null;
  onAddressChange: (address: Address) => void;
  user: User | null;
}

const TopBar: React.FC<TopBarProps> = ({ selectedAddress, onAddressChange, user }) => {
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  // Removed searchQuery state

  const defaultAddresses: Address[] = [
    {
      id: '1',
      label: 'Home',
      address: '31 Nizampet Rd, West End',
      isDefault: true
    },
    {
      id: '2',
      label: 'Office',
      address: '15 Tech Park, Gachibowli',
      isDefault: false
    },
    {
      id: '3',
      label: 'Other',
      address: '42 Jubilee Hills, Hyderabad',
      isDefault: false
    }
  ];

  const addresses = user?.addresses || defaultAddresses;
  const currentAddress = selectedAddress || addresses[0];

  return (
    <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      {/* Main Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        {/* Address Section */}
        <div className="flex items-center flex-1">
          <button
            onClick={() => setShowAddressDropdown(!showAddressDropdown)}
            className="flex items-center space-x-2 text-left"
          >
            <MapPin className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-xs text-gray-500">Deliver to</div>
              <div className="text-sm font-medium text-gray-900 truncate max-w-40">
                📍 {currentAddress.address}
              </div>
            </div>
          </button>
        </div>

        {/* Notification Icon */}
        <button className="p-2 text-gray-600 hover:text-gray-800">
          <Bell className="w-5 h-5" />
        </button>
      </div>

      {/* Removed Search Bar from TopBar */}
      {/* <div className="px-4 py-3 bg-gray-50">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search medicines, health products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
          />
        </div>
      </div> */}

      {/* Address Dropdown */}
      {showAddressDropdown && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-40">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Select Delivery Address</h3>
            <div className="space-y-2">
              {addresses.map((address) => (
                <button
                  key={address.id}
                  onClick={() => {
                    onAddressChange(address);
                    setShowAddressDropdown(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    currentAddress.id === address.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm text-gray-900">{address.label}</div>
                      <div className="text-xs text-gray-600">{address.address}</div>
                    </div>
                    {address.isDefault && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <button className="w-full mt-3 p-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-gray-400 transition-colors">
              + Add New Address
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopBar;

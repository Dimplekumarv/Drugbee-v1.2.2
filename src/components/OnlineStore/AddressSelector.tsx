import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Plus, Home, Briefcase, ChevronDown } from 'lucide-react';
import { useAddressManager, Address } from '../../hooks/useAddressManager';
import AddressForm from '../Account/AddressForm';

interface AddressSelectorProps {
  selectedAddress?: Address | null;
  onAddressSelect: (address: Address) => void;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
  selectedAddress,
  onAddressSelect,
}) => {
  const {
    addresses,
    addAddress,
    setDefaultAddress,
    getDefaultAddress,
    isLoading,
  } = useAddressManager();

  const [showAddForm, setShowAddForm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleOpenAddForm = () => {
    setShowDropdown(false);
    setShowAddForm(true);
  };

  const handleCloseAddForm = () => {
    setShowAddForm(false);
  };

  const handleAddAddress = async (addressData: any) => {
    const success = await addAddress(addressData);
    if (success) {
      setShowAddForm(false);
      // Select the new address if it's the first one
      if (addresses.length === 0) {
        const defaultAddress = getDefaultAddress();
        if (defaultAddress) {
          onAddressSelect(defaultAddress);
        }
      }
    }
  };

  const handleMakeDefault = async (address: Address) => {
    await setDefaultAddress(address.id);
    onAddressSelect(address);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Don't close dropdown if clicking on the add form
        const target = event.target as HTMLElement;
        if (target.closest('.address-form-modal')) return;
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-lg"
      >
        <MapPin className="w-4 h-4 text-gray-500" />
        <div className="flex flex-col items-start">
          <span className="text-xs text-gray-500">Deliver to</span>
          <span className="text-sm font-medium truncate max-w-[200px]">
            {addresses.find(a => a.isDefault) 
              ? `${addresses.find(a => a.isDefault)?.flatNumber}, ${addresses.find(a => a.isDefault)?.street}`
              : 'Select address'
            }
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {/* Address Dropdown */}
      {showDropdown && (
        <div className="absolute top-full mt-1 w-80 bg-white rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900">Select Delivery Address</h2>
              <button
                onClick={handleOpenAddForm}
                type="button"
                className="text-blue-600 text-sm font-medium flex items-center hover:text-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add New Address
              </button>
            </div>
            <div className="space-y-2">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`border rounded-lg p-2 ${
                    address.isDefault ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                  } cursor-pointer hover:border-blue-600`}
                  onClick={() => {
                    handleMakeDefault(address);
                    setShowDropdown(false);
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-1.5 rounded-full ${
                      address.type === 'Home' ? 'bg-blue-100 text-blue-600' :
                      address.type === 'Work' ? 'bg-orange-100 text-orange-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {address.type === 'Home' ? <Home className="w-3 h-3" /> :
                       address.type === 'Work' ? <Briefcase className="w-3 h-3" /> :
                       <MapPin className="w-3 h-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <span className="text-xs font-medium">{address.type}</span>
                        {address.isDefault && (
                          <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-600 text-xs rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5 truncate">
                        {address.flatNumber}, {address.street}
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {address.city}, {address.state} {address.pincode}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add New Address Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-bold text-gray-900">Add New Address</h3>
              <button
                onClick={handleCloseAddForm}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <AddressForm
                onSubmit={handleAddAddress}
                onCancel={handleCloseAddForm}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressSelector;

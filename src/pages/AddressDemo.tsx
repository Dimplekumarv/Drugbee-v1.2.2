import React, { useState } from 'react';
import AddressSelector from '../components/OnlineStore/AddressSelector';
import AddressManager from '../components/Account/AddressManager';
import { Address } from '../hooks/useAddressManager';

const AddressDemo: React.FC = () => {
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [activeView, setActiveView] = useState<'selector' | 'manager'>('selector');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Address Management Demo</h1>
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveView('selector')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeView === 'selector'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Address Selector (Checkout)
            </button>
            <button
              onClick={() => setActiveView('manager')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeView === 'manager'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Address Manager (Account Page)
            </button>
          </div>
        </div>

        {activeView === 'selector' ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Address Selector Component</h2>
            <p className="text-gray-600 mb-6">
              This component is used during checkout to select a delivery address.
            </p>
            
            <div className="border rounded-lg p-4 bg-gray-50">
              <AddressSelector
                selectedAddress={selectedAddress}
                onAddressSelect={(address) => {
                  setSelectedAddress(address);
                  console.log('Selected address:', address);
                }}
              />
            </div>

            {selectedAddress && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">Selected Address:</h3>
                <p className="text-green-700 text-sm">
                  {selectedAddress.flatNumber}, {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} {selectedAddress.pincode}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <AddressManager />
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-800 mb-2">Instructions:</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• <strong>Address Selector:</strong> Click "Deliver to" to see the dropdown, then click "+ Add New Address" to open the form</li>
            <li>• <strong>Address Manager:</strong> Full CRUD operations - Add, Edit, Delete, and Set Default addresses</li>
            <li>• <strong>Google Maps:</strong> Use the map to select location or search using the autocomplete</li>
            <li>• <strong>Form Validation:</strong> All required fields are validated before saving</li>
            <li>• <strong>Local Storage:</strong> Addresses are saved to localStorage for persistence</li>
          </ul>
        </div>

        {/* Google Maps Test */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-medium text-yellow-800 mb-2">Google Maps API Test:</h3>
          <p className="text-yellow-700 text-sm mb-4">
            Open the test file to verify Google Maps API is working: 
            <a 
              href="/test-gmaps.html" 
              target="_blank" 
              className="ml-2 text-blue-600 hover:text-blue-800 underline"
            >
              test-gmaps.html
            </a>
          </p>
          <p className="text-yellow-700 text-sm">
            If the map doesn't load, check the console for errors and verify your Google Maps API key.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddressDemo;
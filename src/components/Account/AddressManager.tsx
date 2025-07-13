import React, { useState } from 'react';
import { MapPin, Plus, Home, Briefcase, Edit, Trash2, Star, X } from 'lucide-react';
import { useAddressManager, Address, AddressFormData } from '../../hooks/useAddressManager';
import AddressForm from './AddressForm';

interface AddressManagerProps {
  onAddressSelect?: (address: Address) => void;
  showSelectButton?: boolean;
}

const AddressManager: React.FC<AddressManagerProps> = ({ 
  onAddressSelect, 
  showSelectButton = false 
}) => {
  const {
    addresses,
    isLoading,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAddressManager();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleAddAddress = async (addressData: AddressFormData) => {
    const success = await addAddress(addressData);
    if (success) {
      setShowAddForm(false);
    }
  };

  const handleUpdateAddress = async (addressData: AddressFormData) => {
    if (!editingAddress) return;
    
    const success = await updateAddress(editingAddress.id, addressData);
    if (success) {
      setEditingAddress(null);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    const success = await deleteAddress(id);
    if (success) {
      setShowDeleteConfirm(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultAddress(id);
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case 'Home':
        return <Home className="w-4 h-4" />;
      case 'Work':
        return <Briefcase className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const getAddressTypeColor = (type: string) => {
    switch (type) {
      case 'Home':
        return 'bg-blue-100 text-blue-600';
      case 'Work':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Addresses</h2>
          <p className="text-gray-600 mt-1">Add, edit, or delete your delivery addresses</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Address List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {addresses.map((address) => (
          <div
            key={address.id}
            className={`border rounded-lg p-4 relative ${
              address.isDefault 
                ? 'border-blue-600 bg-blue-50' 
                : 'border-gray-200 bg-white hover:border-gray-300'
            } transition-colors`}
          >
            {/* Default Badge */}
            {address.isDefault && (
              <div className="absolute top-2 right-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Star className="w-3 h-3 mr-1" />
                  Default
                </span>
              </div>
            )}

            {/* Address Type */}
            <div className="flex items-center space-x-2 mb-3">
              <div className={`p-2 rounded-full ${getAddressTypeColor(address.type)}`}>
                {getAddressTypeIcon(address.type)}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{address.name}</h3>
                <span className="text-xs text-gray-500">{address.type}</span>
              </div>
            </div>

            {/* Address Details */}
            <div className="space-y-1 mb-4">
              <p className="text-sm text-gray-800">
                {address.flatNumber}, {address.street}
              </p>
              {address.landmark && (
                <p className="text-sm text-gray-600">Near {address.landmark}</p>
              )}
              <p className="text-sm text-gray-600">
                {address.city}, {address.state} {address.pincode}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingAddress(address)}
                  className="text-blue-600 hover:text-blue-700 p-1"
                  title="Edit Address"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(address.id)}
                  className="text-red-600 hover:text-red-700 p-1"
                  title="Delete Address"
                  disabled={addresses.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex space-x-2">
                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="text-xs text-gray-600 hover:text-blue-600 px-2 py-1 border border-gray-300 rounded hover:border-blue-600 transition-colors"
                  >
                    Set Default
                  </button>
                )}
                {showSelectButton && onAddressSelect && (
                  <button
                    onClick={() => onAddressSelect(address)}
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                  >
                    Select
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {addresses.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses found</h3>
          <p className="text-gray-600 mb-4">Add your first delivery address to get started</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Address
          </button>
        </div>
      )}

      {/* Add Address Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-bold text-gray-900">Add New Address</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <AddressForm
                onSubmit={handleAddAddress}
                onCancel={() => setShowAddForm(false)}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Address Form Modal */}
      {editingAddress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-bold text-gray-900">Edit Address</h3>
              <button
                onClick={() => setEditingAddress(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <AddressForm
                initialData={{
                  type: editingAddress.type,
                  name: editingAddress.name,
                  flatNumber: editingAddress.flatNumber,
                  street: editingAddress.street,
                  landmark: editingAddress.landmark,
                  city: editingAddress.city,
                  state: editingAddress.state,
                  pincode: editingAddress.pincode,
                  lat: editingAddress.lat,
                  lng: editingAddress.lng,
                }}
                onSubmit={handleUpdateAddress}
                onCancel={() => setEditingAddress(null)}
                isLoading={isLoading}
                submitButtonText="Update Address"
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Delete Address</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this address? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteAddress(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressManager;
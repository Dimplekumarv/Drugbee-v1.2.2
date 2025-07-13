import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Building2,
  Phone,
  X
} from 'lucide-react';
import { Vendor } from '../../types/purchases';
import { addVendor, updateVendor, deleteVendor } from '../../utils/vendorUtils';
import toast from 'react-hot-toast';

interface VendorManagementProps {
  vendors: Vendor[];
  onVendorAdd: (vendor: Vendor) => void;
  onVendorUpdate: (vendor: Vendor) => void;
  onVendorDelete: (vendorId: number) => void;
  onClose: () => void;
}

const VendorManagement: React.FC<VendorManagementProps> = ({
  vendors,
  onVendorAdd,
  onVendorUpdate,
  onVendorDelete,
  onClose
}) => {
  const [showNewVendor, setShowNewVendor] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentVendor, setCurrentVendor] = useState<Partial<Vendor>>({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zip: '',
    gst_number: '',
    drug_license: '',
    is_active: true
  });

  const handleSaveVendor = async () => {
    // Validate required fields
    if (!currentVendor.name?.trim()) {
      toast.error('Please enter vendor name');
      return;
    }
    if (!currentVendor.contact_person?.trim()) {
      toast.error('Please enter contact person name');
      return;
    }
    if (!currentVendor.phone?.trim()) {
      toast.error('Please enter phone number');
      return;
    }
    if (!currentVendor.address?.trim()) {
      toast.error('Please enter address');
      return;
    }

    try {
      const vendorData: Partial<Vendor> = {
        ...currentVendor,
        is_active: true,
        name: currentVendor.name.trim(),
        contact_person: currentVendor.contact_person.trim(),
        phone: currentVendor.phone.trim(),
        email: currentVendor.email?.trim() || '',
        address: currentVendor.address.trim(),
        city: currentVendor.city?.trim(),
        state: currentVendor.state?.trim(),
        country: currentVendor.country?.trim(),
        zip: currentVendor.zip?.trim(),
        gst_number: currentVendor.gst_number?.trim(),
        drug_license: currentVendor.drug_license?.trim()
      };

      if (editingVendor?.id) {
        const updatedVendor = await updateVendor(editingVendor.id, vendorData);
        onVendorUpdate(updatedVendor);
        toast.success('Vendor updated successfully');
      } else {
        const newVendor = await addVendor(vendorData as Omit<Vendor, 'id' | 'created_at' | 'updated_at'>);
        onVendorAdd(newVendor);
        toast.success('Vendor added successfully');
      }

      resetForm();
    } catch (error: any) {
      console.error('Error saving vendor:', error);
      toast.error(error.message || 'Failed to save vendor');
    }
  };

  const resetForm = () => {
    setCurrentVendor({
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      country: '',
      zip: '',
      gst_number: '',
      drug_license: '',
      is_active: true
    });
    setShowNewVendor(false);
    setEditingVendor(null);
  };

  const handleEdit = (vendor: Vendor) => {
    setCurrentVendor(vendor);
    setEditingVendor(vendor);
    setShowNewVendor(true);
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vendor.phone?.includes(searchTerm) ?? false) ||
    (vendor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (vendor.gst_number?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (vendor.drug_license?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Vendor Management</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
            </div>
            
            <button
              onClick={() => setShowNewVendor(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vendor</span>
            </button>
          </div>

          {/* Vendor Form */}
          {showNewVendor && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor Name *
                  </label>
                  <input
                    type="text"
                    value={currentVendor.name || ''}
                    onChange={(e) => setCurrentVendor(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    placeholder="Enter vendor name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={currentVendor.phone || ''}
                    onChange={(e) => setCurrentVendor(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={currentVendor.email || ''}
                    onChange={(e) => setCurrentVendor(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    placeholder="Enter email address"
                  />
                </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Person Name
                    </label>
                    <input
                    type="text"
                    value={currentVendor.contact_person || ''}
                    onChange={(e) =>
                      setCurrentVendor((prev) => ({ ...prev, contact_person: e.target.value }))
                    }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                      placeholder="Enter contact person name"
                      required
                      />
                    </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={currentVendor.address || ''}
                    onChange={(e) => setCurrentVendor(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    placeholder="Enter address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={currentVendor.city || ''}
                    onChange={(e) => setCurrentVendor(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={currentVendor.state || ''}
                    onChange={(e) => setCurrentVendor(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    placeholder="Enter state"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={currentVendor.country || ''}
                    onChange={(e) => setCurrentVendor(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    placeholder="Enter country"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={currentVendor.zip || ''}
                    onChange={(e) => setCurrentVendor(prev => ({ ...prev, zip: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    placeholder="Enter ZIP code"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GSTIN Number
                  </label>
                  <input
                    type="text"
                    value={currentVendor.gst_number || ''}
                    onChange={(e) => setCurrentVendor(prev => ({ ...prev, gst_number: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    placeholder="Enter 15-digit GSTIN"
                    pattern="[A-Z0-9]{15}"
                    maxLength={15}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Drug License Number
                  </label>
                  <input
                    type="text"
                    value={currentVendor.drug_license || ''}
                    onChange={(e) => setCurrentVendor(prev => ({ ...prev, drug_license: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    placeholder="Enter drug license number"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={resetForm}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveVendor}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  {editingVendor ? 'Update Vendor' : 'Add Vendor'}
                </button>
              </div>
            </div>
          )}              {/* Vendors Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business Info
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vendor.phone}</div>
                      <div className="text-sm text-gray-500">{vendor.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">GST: {vendor.gst_number || 'N/A'}</div>
                      <div className="text-sm text-gray-500">License: {vendor.drug_license || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vendor.address}</div>
                      <div className="text-sm text-gray-500">
                        {[vendor.city, vendor.state, vendor.country, vendor.zip].filter(Boolean).join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(vendor)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onVendorDelete(vendor.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorManagement;
import React, { useState, useEffect } from 'react';
import {
  User as UserIcon, // Renamed to avoid conflict with type
  MapPin,
  ShoppingBag,
  Heart,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Phone,
  Mail,
  Edit,
  Plus,
  XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Address } from '../../types'; // Import User and Address types

interface AccountPageProps {
  user: User | null;
  onLogin: (userData: User) => void;
  onLogout: () => void;
  onUpdateUser: (userData: User) => void; // Added prop for updating user
}

const AccountPage: React.FC<AccountPageProps> = ({ user, onLogin, onLogout, onUpdateUser }) => {
  const navigate = useNavigate();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [selectedDocumentFile, setSelectedDocumentFile] = useState<File | null>(null);

  // Initialize editedUser state when user prop changes or editing starts
  useEffect(() => {
    if (user) {
      setEditedUser({ ...user });
    }
  }, [user, isEditingProfile]);

  const mockOrders = [
    {
      id: 'ORD001',
      date: '2024-01-15',
      status: 'Delivered',
      total: 450.00,
      items: 3
    },
    {
      id: 'ORD002',
      date: '2024-01-10',
      status: 'Processing',
      total: 280.00,
      items: 2
    },
    {
      id: 'ORD003',
      date: '2024-01-05',
      status: 'Delivered',
      total: 650.00,
      items: 5
    }
  ];

  const handleLogin = () => {
    navigate('/online-store/login');
  };

  const handleLogout = () => {
    onLogout();
    toast.success('Logged out successfully');
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setSelectedDocumentFile(null); // Clear selected file on cancel
    if (user) {
      setEditedUser({ ...user }); // Reset edited user state
    }
  };

  const handleSaveProfile = () => {
    if (!editedUser) return;

    // --- Placeholder for saving logic ---
    // In a real application, you would send editedUser data and selectedDocumentFile
    // to your backend/API (e.g., Supabase) to update the user record and upload the file.
    console.log('Saving profile:', editedUser);
    console.log('Selected document file:', selectedDocumentFile);

    // Simulate successful save
    onUpdateUser(editedUser); // Update user state in parent component
    toast.success('Profile updated successfully (simulated)');
    setIsEditingProfile(false);
    setSelectedDocumentFile(null); // Clear selected file after save
    // --- End Placeholder ---
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedDocumentFile(file);
    // In a real app, you might want to upload the file immediately or store a reference
    // setEditedUser(prev => prev ? { ...prev, govtDocumentUrl: file ? 'temp-url-or-ref' : null } : null);
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'text-green-600 bg-green-100';
      case 'Processing':
        return 'text-blue-600 bg-blue-100';
      case 'Shipped':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 m-4 text-center max-w-sm w-full">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserIcon className="w-10 h-10 text-blue-600" />
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to PharmaCare</h2>
          <p className="text-gray-600 mb-6">Sign in to access your account and track orders</p>

          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors mb-4"
          >
            Sign In / Sign Up
          </button>

          <p className="text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 mt-14">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{user.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              {user.govtDocumentType && user.govtIdNumber && (
                 <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>{user.govtDocumentType}: {user.govtIdNumber}</span>
                 </div>
              )}
               {user.govtDocumentUrl && (
                 <div className="flex items-center space-x-2 text-sm text-blue-600">
                    <a href={user.govtDocumentUrl} target="_blank" rel="noopener noreferrer" className="underline">View Document</a>
                 </div>
              )}
            </div>
            <button
              onClick={handleEditProfile}
              className="p-2 text-gray-600 hover:text-gray-800"
            >
              <Edit className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <ShoppingBag className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-gray-900">{mockOrders.length}</div>
            <div className="text-xs text-gray-600">Total Orders</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <Heart className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-gray-900">12</div>
            <div className="text-xs text-gray-600">Wishlist</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <MapPin className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-gray-900">{user.addresses?.length || 0}</div>
            <div className="text-xs text-gray-600">Addresses</div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <button className="text-blue-600 text-sm font-medium">View All</button>
          </div>

          <div className="space-y-4">
            {mockOrders.slice(0, 3).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-gray-900">#{order.id}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {order.date} • {order.items} items • ₹{order.total}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Menu Options */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="divide-y divide-gray-100">
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Manage Addresses</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <Heart className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Wishlist</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Settings</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <HelpCircle className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Help & Support</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-50 text-red-600 py-4 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>

      {/* Profile Edit Modal */}
      {isEditingProfile && editedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Edit Profile</h3>
              <button onClick={handleCancelEdit} className="text-gray-600 hover:text-gray-800">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={editedUser.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  id="phone"
                  value={editedUser.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email (Optional)</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={editedUser.email || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="govtDocumentType" className="block text-sm font-medium text-gray-700">Government Document Type</label>
                <select
                  name="govtDocumentType"
                  id="govtDocumentType"
                  value={editedUser.govtDocumentType || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select Document Type</option>
                  <option value="Aadhaar">Aadhaar</option>
                  <option value="Voter ID">Voter ID</option>
                  <option value="Driving Licence">Driving Licence</option>
                </select>
              </div>
              {editedUser.govtDocumentType && (
                <div>
                  <label htmlFor="govtIdNumber" className="block text-sm font-medium text-gray-700">{editedUser.govtDocumentType} Number</label>
                  <input
                    type="text"
                    name="govtIdNumber"
                    id="govtIdNumber"
                    value={editedUser.govtIdNumber || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              )}
               {editedUser.govtDocumentType && (
                <div>
                  <label htmlFor="govtDocument" className="block text-sm font-medium text-gray-700">Upload Document (Image/PDF)</label>
                  <input
                    type="file"
                    name="govtDocument"
                    id="govtDocument"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                   {selectedDocumentFile && (
                      <p className="mt-2 text-sm text-gray-600">Selected file: {selectedDocumentFile.name}</p>
                   )}
                   {editedUser.govtDocumentUrl && !selectedDocumentFile && (
                       <p className="mt-2 text-sm text-blue-600">Existing document uploaded. <a href={editedUser.govtDocumentUrl} target="_blank" rel="noopener noreferrer" className="underline">View</a></p>
                   )}
                </div>
               )}
            </div>
            <div className="p-4 bg-gray-50 flex justify-end space-x-3 rounded-b-xl">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;

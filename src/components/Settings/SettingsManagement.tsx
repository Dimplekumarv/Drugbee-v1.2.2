import React, { useState } from 'react';
import { 
  Settings, 
  Building2, 
  Users, 
  Shield, 
  Bell, 
  Database, 
  Printer, 
  Wifi,
  HardDrive,
  Monitor,
  Smartphone,
  Globe,
  Lock,
  Key,
  FileText,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import PharmacySettings from './PharmacySettings';
import toast from 'react-hot-toast';

const SettingsManagement: React.FC = () => {
  const [activeSection, setActiveSection] = useState('pharmacy');

  const settingSections = [
    {
      id: 'pharmacy',
      title: 'Pharmacy Details',
      description: 'Configure pharmacy information and billing settings',
      icon: Building2,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'users',
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: Users,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'security',
      title: 'Security Settings',
      description: 'Configure security and access controls',
      icon: Shield,
      color: 'bg-red-100 text-red-600'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Set up alerts and notification preferences',
      icon: Bell,
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      id: 'backup',
      title: 'Backup & Restore',
      description: 'Manage data backup and restoration',
      icon: Database,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 'printing',
      title: 'Printing Setup',
      description: 'Configure printers and print settings',
      icon: Printer,
      color: 'bg-indigo-100 text-indigo-600'
    },
    {
      id: 'integrations',
      title: 'Integrations',
      description: 'Connect with external services and APIs',
      icon: Wifi,
      color: 'bg-pink-100 text-pink-600'
    },
    {
      id: 'system',
      title: 'System Settings',
      description: 'Advanced system configuration',
      icon: Settings,
      color: 'bg-gray-100 text-gray-600'
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'pharmacy':
        return <PharmacySettings />;
      
      case 'users':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">User Management</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">Coming Soon</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    User management features will be available in the next update.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'security':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Settings</h2>
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Password Policy</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Minimum password length</span>
                    <input type="number" value="8" className="w-20 p-2 border border-gray-300 rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Require special characters</span>
                    <input type="checkbox" checked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Password expiry (days)</span>
                    <input type="number" value="90" className="w-20 p-2 border border-gray-300 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'notifications':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Settings</h2>
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Low stock alerts</span>
                    <input type="checkbox" checked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Expiry notifications</span>
                    <input type="checkbox" checked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Daily sales summary</span>
                    <input type="checkbox" className="rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'backup':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Backup & Restore</h2>
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Automatic Backup</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Enable automatic backup</span>
                    <input type="checkbox" checked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Backup frequency</span>
                    <select className="p-2 border border-gray-300 rounded">
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                  <div className="flex space-x-3">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                      <Download className="w-4 h-4" />
                      <span>Create Backup</span>
                    </button>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
                      <Upload className="w-4 h-4" />
                      <span>Restore Backup</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {settingSections.find(s => s.id === activeSection)?.title}
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">Coming Soon</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    This feature is under development and will be available soon.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  if (activeSection === 'pharmacy') {
    return <PharmacySettings />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-900 mb-6">Settings</h1>
            
            <div className="space-y-2">
              {settingSections.map(section => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left p-4 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-red-50 border border-red-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${section.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{section.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsManagement;

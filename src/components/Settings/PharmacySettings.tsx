import React, { useState, useRef } from 'react';
import { 
  Save, 
  Upload, 
  Building2, 
  Phone, 
  Mail, 
  FileText, 
  Hash, 
  Shield, 
  Settings as SettingsIcon,
  Camera,
  X,
  Check,
  AlertCircle,
  Info,
  Download,
  Eye,
  Edit3,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PharmacyConfig {
  // Pharmacy Details
  pharmacyName: string;
  address: string;
  contactNumber: string;
  email: string;
  pan: string;
  drugLicenseNumber: string;
  gstNumber: string;
  fssaiLicense: string;
  
  // Billing Metadata
  billNumberPrefix: string;
  billStartNumber: number;
  generatedBy: string;
  logoUrl: string;
  
  // Additional Settings
  timezone: string;
  currency: string;
  
  // Print Settings
  printFormat: 'A4' | 'A5' | 'thermal';
  showLogo: boolean;
  showQRCode: boolean;
  footerText: string;
}

const PharmacySettings: React.FC = () => {
  const [config, setConfig] = useState<PharmacyConfig>({
    // Pharmacy Details
    pharmacyName: 'PharmaCare Medical & General Store',
    address: '#56, 2nd Floor, 12th Main Road, Sector 6, HSR Layout, Bengaluru, Karnataka - 560102',
    contactNumber: '+91-9035638000',
    email: 'info@pharmacare.com',
    pan: 'AASFD1081C',
    drugLicenseNumber: 'KA/GLB/20B/426/21B/415',
    gstNumber: '29ABYPB7940B1ZF',
    fssaiLicense: 'RR/20B/MP/4792',
    
    // Billing Metadata
    billNumberPrefix: 'DB',
    billStartNumber: 1,
    generatedBy: 'Dimple Kumar',
    logoUrl: '',
    
    // Additional Settings
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    
    // Print Settings
    printFormat: 'A4',
    showLogo: true,
    showQRCode: true,
    footerText: 'Thank you for choosing PharmaCare!'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('pharmacy');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof PharmacyConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error('Logo file size should be less than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        setConfig(prev => ({ ...prev, logoUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Save to localStorage (in production, this would be an API call)
    localStorage.setItem('pharmacyConfig', JSON.stringify(config));
    toast.success('Pharmacy settings saved successfully!');
    setIsEditing(false);
  };

  const handleReset = () => {
    // Reset to default values
    const defaultConfig = {
      pharmacyName: 'PharmaCare Medical & General Store',
      address: '#56, 2nd Floor, 12th Main Road, Sector 6, HSR Layout, Bengaluru, Karnataka - 560102',
      contactNumber: '+91-9035638000',
      email: 'info@pharmacare.com',
      pan: 'AASFD1081C',
      drugLicenseNumber: 'KA/GLB/20B/426/21B/415',
      gstNumber: '29ABYPB7940B1ZF',
      fssaiLicense: 'RR/20B/MP/4792',
      billNumberPrefix: 'DB',
      billStartNumber: 1,
      generatedBy: 'Dimple Kumar',
      logoUrl: '',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      printFormat: 'A4' as const,
      showLogo: true,
      showQRCode: true,
      footerText: 'Thank you for choosing PharmaCare!'
    };
    setConfig(defaultConfig);
    setLogoPreview(null);
    toast.success('Settings reset to default values');
  };

  const handleExportConfig = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pharmacy-config.json';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Configuration exported successfully');
  };

  const generateSampleBillNumber = () => {
    const paddedNumber = config.billStartNumber.toString().padStart(6, '0');
    return `${config.billNumberPrefix}${paddedNumber}`;
  };

  const tabs = [
    { id: 'pharmacy', label: 'Pharmacy Details', icon: Building2 },
    { id: 'billing', label: 'Billing Settings', icon: FileText },
    { id: 'print', label: 'Print Settings', icon: SettingsIcon },
    { id: 'advanced', label: 'Advanced', icon: SettingsIcon }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pharmacy Settings</h1>
          <p className="text-gray-600">Configure your pharmacy details and billing preferences</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto mt-4 lg:mt-0">
          <button
            onClick={handleExportConfig}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Config</span>
          </button>
          
          <button
            onClick={handleReset}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset to Default</span>
          </button>
          
          {isEditing ? (
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Settings</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Pharmacy Details Tab */}
          {activeTab === 'pharmacy' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Building2 className="w-5 h-5 mr-2" />
                    Basic Information
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pharmacy Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={config.pharmacyName}
                      onChange={(e) => handleInputChange('pharmacyName', e.target.value)}
                      disabled={!isEditing}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none disabled:bg-gray-50"
                      placeholder="Enter pharmacy name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={config.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none disabled:bg-gray-50"
                      placeholder="Enter complete address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          type="tel"
                          value={config.contactNumber}
                          onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none disabled:bg-gray-50"
                          placeholder="+91-9876543210"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          type="email"
                          value={config.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none disabled:bg-gray-50"
                          placeholder="info@pharmacy.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Legal Information
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PAN Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Hash className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        value={config.pan}
                        onChange={(e) => handleInputChange('pan', e.target.value.toUpperCase())}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none disabled:bg-gray-50"
                        placeholder="AASFD1081C"
                        maxLength={10}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Drug License Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={config.drugLicenseNumber}
                      onChange={(e) => handleInputChange('drugLicenseNumber', e.target.value)}
                      disabled={!isEditing}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none disabled:bg-gray-50"
                      placeholder="KA/GLB/20B/426/21B/415"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GST Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={config.gstNumber}
                      onChange={(e) => handleInputChange('gstNumber', e.target.value.toUpperCase())}
                      disabled={!isEditing}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none disabled:bg-gray-50"
                      placeholder="29ABYPB7940B1ZF"
                      maxLength={15}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      FSSAI License
                    </label>
                    <input
                      type="text"
                      value={config.fssaiLicense}
                      onChange={(e) => handleInputChange('fssaiLicense', e.target.value)}
                      disabled={!isEditing}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none disabled:bg-gray-50"
                      placeholder="RR/20B/MP/4792"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Billing Settings Tab */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Billing Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Billing Configuration
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bill Number Prefix <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={config.billNumberPrefix}
                        onChange={(e) => handleInputChange('billNumberPrefix', e.target.value.toUpperCase())}
                        disabled={!isEditing}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none disabled:bg-gray-50"
                        placeholder="DB"
                        maxLength={5}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bill Start Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={config.billStartNumber}
                        onChange={(e) => handleInputChange('billStartNumber', parseInt(e.target.value) || 1)}
                        disabled={!isEditing}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none disabled:bg-gray-50"
                        placeholder="1"
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-800">Bill Number Preview</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Next bill number will be: <span className="font-mono font-bold">{generateSampleBillNumber()}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Generated By <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={config.generatedBy}
                      onChange={(e) => handleInputChange('generatedBy', e.target.value)}
                      disabled={!isEditing}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none disabled:bg-gray-50"
                      placeholder="Dimple Kumar"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Bill signature name
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={config.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      disabled={!isEditing}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none disabled:bg-gray-50"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                </div>

                {/* Logo Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Camera className="w-5 h-5 mr-2" />
                    Logo & Branding
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pharmacy Logo
                    </label>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {logoPreview || config.logoUrl ? (
                        <div className="space-y-4">
                          <img
                            src={logoPreview || config.logoUrl}
                            alt="Pharmacy Logo"
                            className="mx-auto h-24 w-24 object-contain rounded-lg border border-gray-200"
                          />
                          {isEditing && (
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Change Logo
                              </button>
                              <button
                                onClick={() => {
                                  setLogoPreview(null);
                                  setConfig(prev => ({ ...prev, logoUrl: '' }));
                                }}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove Logo
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="text-sm text-gray-600">
                            <button
                              onClick={() => isEditing && fileInputRef.current?.click()}
                              disabled={!isEditing}
                              className="text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                            >
                              Upload a logo
                            </button>
                            <p className="text-xs text-gray-500 mt-1">
                              PNG, JPG up to 2MB
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Print Settings Tab */}
          {activeTab === 'print' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Print Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <SettingsIcon className="w-5 h-5 mr-2" />
                    Print Configuration
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Print Format
                    </label>
                    <select
                      value={config.printFormat}
                      onChange={(e) => handleInputChange('printFormat', e.target.value)}
                      disabled={!isEditing}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none disabled:bg-gray-50"
                    >
                      <option value="A4">A4 (210 × 297 mm)</option>
                      <option value="A5">A5 (148 × 210 mm)</option>
                      <option value="thermal">Thermal (80mm)</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Show Logo on Bills
                      </label>
                      <button
                        onClick={() => handleInputChange('showLogo', !config.showLogo)}
                        disabled={!isEditing}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          config.showLogo ? 'bg-red-600' : 'bg-gray-200'
                        } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            config.showLogo ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Show QR Code
                      </label>
                      <button
                        onClick={() => handleInputChange('showQRCode', !config.showQRCode)}
                        disabled={!isEditing}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          config.showQRCode ? 'bg-red-600' : 'bg-gray-200'
                        } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            config.showQRCode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Footer Text
                    </label>
                    <textarea
                      value={config.footerText}
                      onChange={(e) => handleInputChange('footerText', e.target.value)}
                      disabled={!isEditing}
                      rows={2}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none disabled:bg-gray-50"
                      placeholder="Thank you for choosing PharmaCare!"
                    />
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Eye className="w-5 h-5 mr-2" />
                    Bill Preview
                  </h3>
                  
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="bg-white p-4 rounded shadow-sm text-xs">
                      {config.showLogo && config.logoUrl && (
                        <div className="text-center mb-2">
                          <img src={config.logoUrl} alt="Logo" className="h-8 mx-auto" />
                        </div>
                      )}
                      <div className="text-center mb-3">
                        <div className="font-bold">{config.pharmacyName}</div>
                        <div className="text-xs">{config.address}</div>
                        <div className="text-xs">Contact: {config.contactNumber}</div>
                        <div className="text-xs">GST: {config.gstNumber}</div>
                      </div>
                      <div className="border-t border-b py-2 my-2">
                        <div className="flex justify-between">
                          <span>Bill No: {generateSampleBillNumber()}</span>
                          <span>Date: {new Date().toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-center text-xs mt-3">
                        {config.footerText}
                      </div>
                      <div className="text-center text-xs mt-2">
                        Generated by {config.generatedBy}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Advanced Settings</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      These settings affect system behavior. Please be careful when making changes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">System Configuration</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      value={config.timezone}
                      onChange={(e) => handleInputChange('timezone', e.target.value)}
                      disabled={!isEditing}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none disabled:bg-gray-50"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Integration Settings</h3>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-800">Auto-Population</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          These settings will automatically populate in all sales bills, purchase entries, and reports.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Confirmation */}
      {isEditing && (
        <div className="fixed bottom-6 right-6 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-gray-700">You have unsaved changes</span>
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              Save Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacySettings;

import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Shield, Phone, Mail, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: Address[];
}

interface Address {
  id: string;
  label: string;
  address: string;
  isDefault: boolean;
}

interface LoginPageProps {
  onLogin: (userData: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      // Login logic
      if (!formData.email || !formData.password) {
        toast.error('Please fill all required fields');
        return;
      }

      // Mock login - in real app, validate against backend
      const userData: User = {
        id: '1',
        name: formData.email === 'admin@pharmacy.com' ? 'Admin User' : 'John Doe',
        email: formData.email,
        phone: '+91-9876543210',
        addresses: [
          {
            id: '1',
            label: 'Home',
            address: '31 Nizampet Rd, West End',
            isDefault: true
          }
        ]
      };

      // Check if admin login
      if (formData.email === 'admin@pharmacy.com' && formData.password === 'admin123') {
        toast.success('Admin login successful! Redirecting to dashboard...');
        // Redirect to admin dashboard
        window.location.href = '/';
        return;
      }

      onLogin(userData);
      toast.success('Login successful!');
      navigate('/online-store');
    } else {
      // Sign up logic
      if (!formData.name || !formData.email || !formData.phone || !formData.password) {
        toast.error('Please fill all required fields');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }

      // Mock sign up
      const userData: User = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        addresses: []
      };

      onLogin(userData);
      toast.success('Account created successfully!');
      navigate('/online-store');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </h1>
          <div className="w-9"></div>
        </div>
      </div>

      <div className="p-6">
        {/* Logo and Welcome */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to PharmaCare
          </h2>
          <p className="text-gray-600">
            {isLogin 
              ? 'Sign in to your account to continue' 
              : 'Create an account to get started'
            }
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter your full name"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="+91-9876543210"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Confirm your password"
                required={!isLogin}
              />
            </div>
          )}

          {isLogin && (
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <button type="button" className="text-sm text-blue-600 hover:text-blue-800">
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Toggle Login/Signup */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 font-medium hover:text-blue-800"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        {/* Demo Credentials */}
        {isLogin && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Demo Credentials:</h4>
            <div className="text-xs text-blue-700 space-y-1">
              <div><strong>Customer:</strong> user@pharmacy.com / password123</div>
              <div><strong>Admin:</strong> admin@pharmacy.com / admin123</div>
            </div>
          </div>
        )}

        {/* Terms */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our{' '}
            <button className="text-blue-600 hover:text-blue-800">Terms of Service</button>
            {' '}and{' '}
            <button className="text-blue-600 hover:text-blue-800">Privacy Policy</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

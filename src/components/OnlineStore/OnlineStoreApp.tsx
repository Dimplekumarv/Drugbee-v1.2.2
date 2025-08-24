import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Components
import HomePage from './HomePage';
import StorePage from './StorePage';
import CartPage from './CartPage';
import AccountPage from './AccountPage';
import ProductDetailPage from './ProductDetailPage';
import LoginPage from './LoginPage';
import BottomNavigation from './BottomNavigation';
import TopBar from './TopBar';

// Types
import { Product } from '../../types'; // Import Product type

interface CartItem {
  id: string; // Unique ID for the cart item instance
  productId: string; // ID of the product
  name: string;
  price: number;
  mrp: number;
  quantity: number;
  image: string;
  composition: string;
  manufacturer: string;
}

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

const OnlineStoreApp: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  useEffect(() => {
    // Check for logged in user
    const savedUser = localStorage.getItem('onlineStoreUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setSelectedAddress(userData.addresses?.find((addr: Address) => addr.isDefault) || null);
    }

    // Load cart items
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('onlineStoreUser', JSON.stringify(userData));
    setSelectedAddress(userData.addresses?.find(addr => addr.isDefault) || null);
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedAddress(null);
    localStorage.removeItem('onlineStoreUser');
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    const existingItem = cartItems.find(item => item.productId === product.id);

    if (existingItem) {
      const updatedItems = cartItems.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
      setCartItems(updatedItems);
      localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    } else {
      const newItem: CartItem = {
        id: Date.now().toString(), // Unique ID for this cart item instance
        productId: product.id,
        name: product.name,
        price: product.price,
        mrp: product.mrp,
        quantity,
        image: product.images[0] || '/api/placeholder/100/100', // Use first image or placeholder
        composition: product.composition,
        manufacturer: product.manufacturer
      };
      const updatedItems = [...cartItems, newItem];
      setCartItems(updatedItems);
      localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    }
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const updatedItems = cartItems.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    );
    setCartItems(updatedItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
  };

  const removeFromCart = (itemId: string) => {
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
  };

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar
        selectedAddress={selectedAddress}
        onAddressChange={setSelectedAddress}
        user={user}
      />

      <main className="pb-20 pt-16">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                user={user}
                onAddToCart={addToCart}
              />
            }
          />
          <Route
            path="/store"
            element={
              <StorePage
                onAddToCart={addToCart}
                onUpdateQuantity={updateCartQuantity}
                onRemoveItem={removeFromCart}
                cartItems={cartItems}
              />
            }
          />
          <Route
            path="/cart"
            element={
              <CartPage
                cartItems={cartItems}
                onUpdateQuantity={updateCartQuantity}
                onRemoveItem={removeFromCart}
                selectedAddress={selectedAddress}
              />
            }
          />
          <Route
            path="/account"
            element={
              <AccountPage
                user={user}
                onLogin={handleLogin}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            path="/product/:id"
            element={
              <ProductDetailPage
                onAddToCart={addToCart}
              />
            }
          />
          <Route
            path="/login"
            element={
              <LoginPage
                onLogin={handleLogin}
              />
            }
          />
          <Route path="/*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <BottomNavigation cartItemCount={cartItemCount} />

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2000,
          style: {
            background: '#fff',
            color: '#333',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          },
        }}
      />
    </div>
  );
};

export default OnlineStoreApp;

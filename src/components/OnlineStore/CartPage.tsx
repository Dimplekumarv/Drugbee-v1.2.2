import React, { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, MapPin, CreditCard, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Address } from '../../types'; // Import Address type

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  mrp: number;
  quantity: number;
  image: string;
  composition: string;
  manufacturer: string;
}

interface CartPageProps {
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  selectedAddress: Address | null;
}

const CartPage: React.FC<CartPageProps> = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  selectedAddress
}) => {
  const navigate = useNavigate();
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalMRP = cartItems.reduce((sum, item) => sum + (item.mrp * item.quantity), 0);
  const totalSavings = totalMRP - subtotal;
  const deliveryCharge = subtotal >= 500 ? 0 : 50;
  // Calculate total including discount
  const total = subtotal - discountAmount + deliveryCharge;

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    onUpdateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId: string, itemName: string) => {
    onRemoveItem(itemId);
    toast.success(`${itemName} removed from cart`);
    // If the removed item affects the subtotal such that the coupon discount needs recalculation,
    // you would call a function here to re-evaluate the discount.
    // For this simple example, we'll assume the discount is fixed or percentage of original subtotal.
    // A more robust system would recalculate.
  };

  const handleApplyCoupon = () => {
    // --- Placeholder for coupon validation and application logic ---
    // In a real application, you would validate the coupon code against your backend
    // and get the actual discount amount or percentage.
    const code = couponCodeInput.trim().toUpperCase();

    if (code === 'SAVE10') {
      const discount = subtotal * 0.10; // 10% discount
      setDiscountAmount(discount);
      setAppliedCoupon(code);
      toast.success(`Coupon "${code}" applied! You saved ₹${discount.toFixed(2)}`);
    } else if (code === 'FREEDELIVERY' && deliveryCharge > 0) {
       setDiscountAmount(deliveryCharge); // Discount equals delivery charge
       setAppliedCoupon(code);
       toast.success(`Coupon "${code}" applied! Enjoy free delivery.`);
    }
    else {
      setDiscountAmount(0);
      setAppliedCoupon(null);
      toast.error('Invalid or inapplicable coupon code');
    }
    // --- End Placeholder ---
  };


  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    // Create order object for admin system
    const newOrder = {
      id: `ORD-${Date.now()}`,
      customerId: 'online-customer', // This would come from logged in user
      customerName: 'Online Customer', // This would come from logged in user
      customerPhone: '+91-9876543210', // This would come from logged in user
      items: cartItems.map(item => ({
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      })),
      subtotal: subtotal,
      discount: discountAmount, // Include applied discount
      deliveryCharge: deliveryCharge,
      total: total, // Use the calculated total
      status: 'pending' as const,
      paymentMethod: 'cod' as const, // Assuming COD for now
      paymentStatus: 'pending' as const,
      deliveryAddress: selectedAddress.address,
      notes: `Order from online store${appliedCoupon ? ` (Coupon: ${appliedCoupon})` : ''}`, // Add coupon info to notes
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save order to localStorage for admin system to pick up
    const existingOrders = JSON.parse(localStorage.getItem('onlineStoreOrders') || '[]');
    existingOrders.push(newOrder);
    localStorage.setItem('onlineStoreOrders', JSON.stringify(existingOrders));

    toast.success('Order placed successfully!');

    // Clear cart after successful order
    cartItems.forEach(item => onRemoveItem(item.id));
    setCouponCodeInput(''); // Clear coupon input
    setAppliedCoupon(null); // Clear applied coupon state
    setDiscountAmount(0); // Reset discount amount

    navigate('/online-store/account'); // Navigate to account page or order confirmation
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some medicines to get started</p>
          <button
            onClick={() => navigate('/online-store/store')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-16">
      <div className="p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-sm text-gray-600">{cartItems.length} items in your cart</p>
        </div>

        {/* Delivery Address */}
        {selectedAddress && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Deliver to {selectedAddress.label}</div>
                <div className="text-sm text-gray-600">{selectedAddress.address}</div>
              </div>
              {/* <button className="text-blue-600 text-sm font-medium">Change</button> {/* Add Change Address functionality */}
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="space-y-4 mb-6">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-start space-x-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                />

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-gray-900 mb-1">{item.name}</h3>
                  <div className="text-xs text-gray-500 mb-1">{item.manufacturer}</div>
                  <div className="text-xs text-gray-600 mb-3">{item.composition}</div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-gray-900">₹{item.price}</span>
                      {item.mrp > item.price && (
                        <span className="text-xs text-gray-500 line-through">₹{item.mrp}</span>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="p-2 text-gray-600 hover:text-gray-800"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-2 text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="p-2 text-gray-600 hover:text-gray-800"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.id, item.name)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Apply Coupon */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
           <h3 className="font-semibold text-gray-900 mb-4">Apply Coupon</h3>
           {appliedCoupon ? (
              <div className="flex items-center justify-between text-green-600 bg-green-50 p-3 rounded-lg">
                 <div className="flex items-center space-x-2">
                    <Tag className="w-5 h-5" />
                    <span className="font-medium">"{appliedCoupon}" Applied</span>
                 </div>
                 <button
                    onClick={() => {
                       setAppliedCoupon(null);
                       setDiscountAmount(0);
                       setCouponCodeInput('');
                       toast.success('Coupon removed');
                    }}
                    className="text-sm font-medium underline"
                 >
                    Remove
                 </button>
              </div>
           ) : (
              <div className="flex space-x-2">
                 <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                 />
                 <button
                    onClick={handleApplyCoupon}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-blue-700 transition-colors"
                 >
                    Apply
                 </button>
              </div>
           )}
        </div>


        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
              <span className="font-medium">₹{subtotal.toFixed(2)}</span>
            </div>

            {totalSavings > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Savings (on MRP)</span>
                <span className="font-medium text-green-600">-₹{totalSavings.toFixed(2)}</span>
              </div>
            )}

            {discountAmount > 0 && (
                 <div className="flex justify-between text-sm text-green-600">
                    <span className="text-gray-600">Coupon Discount ({appliedCoupon})</span>
                    <span className="font-medium">-₹{discountAmount.toFixed(2)}</span>
                 </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery Charges</span>
              <span className="font-medium">
                {deliveryCharge === 0 ? (
                  <span className="text-green-600">FREE</span>
                ) : (
                  `₹${deliveryCharge.toFixed(2)}`
                )}
              </span>
            </div>

            {subtotal < 500 && (
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                Add ₹{(500 - subtotal).toFixed(2)} more for FREE delivery
              </div>
            )}

            <div className="border-t pt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Payment Method</h3>

          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="radio" name="payment" value="cod" defaultChecked className="text-blue-600" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  💰
                </div>
                <span className="text-sm font-medium">Cash on Delivery</span>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="radio" name="payment" value="online" className="text-blue-600" disabled /> {/* Disable online for now */}
              <div className="flex items-center space-x-2 text-gray-400"> {/* Style disabled */}
                <CreditCard className="w-8 h-8" />
                <span className="text-sm font-medium">Online Payment (Coming Soon)</span>
              </div>
            </label>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
        >
          Place Order • ₹{total.toFixed(2)}
        </button>
      </div>
    </div>
  );
};

export default CartPage;

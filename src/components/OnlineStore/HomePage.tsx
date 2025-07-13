import React, { useState } from 'react';
import { ChevronRight, Star, ShoppingCart, Percent, Clock, Shield, Truck, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AddressSelector from './AddressSelector';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface HomePageProps {
  user: User | null;
  onAddToCart: (product: any, quantity?: number) => void;
}

const HomePage: React.FC<HomePageProps> = ({ user, onAddToCart }) => {
  const navigate = useNavigate();
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  // State to track wishlisted status for each product locally on Home Page
  const [wishlistedProducts, setWishlistedProducts] = useState<{ [key: string]: boolean }>({});


  const offers = [
    {
      id: 1,
      title: '30% Discount',
      subtitle: 'for Medicines',
      description: 'Get up to 30% off on all medicines',
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      image: '💊'
    },
    {
      id: 2,
      title: 'Free Delivery',
      subtitle: 'on orders above ₹500',
      description: 'No delivery charges for orders above ₹500',
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      image: '🚚'
    },
    {
      id: 3,
      title: 'Health Checkup',
      subtitle: 'Book Now',
      description: 'Complete health checkup at home',
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      image: '🩺'
    }
  ];

  // Categories matching the UI screenshot
  const categories = [
    { id: 'Medicines', name: 'Medicines', icon: '💊', color: 'bg-blue-100 text-blue-600' },
    { id: 'Functional Foods', name: 'Functional Foods', icon: '🥗', color: 'bg-green-100 text-green-600' },
    { id: 'Personal Care', name: 'Personal Care', icon: '🧴', color: 'bg-pink-100 text-pink-600' },
    { id: 'Health Devices', name: 'Health Devices', icon: '🩺', color: 'bg-purple-100 text-purple-600' },
    { id: 'Baby Care', name: 'Baby Care', icon: '👶', color: 'bg-yellow-100 text-yellow-600' },
    { id: 'Vitamins', name: 'Vitamins', icon: '💊', color: 'bg-orange-100 text-orange-600' },
    { id: 'First Aid', name: 'First Aid', icon: '🏥', color: 'bg-red-100 text-red-600' },
    { id: 'Beauty', name: 'Beauty', icon: '💄', color: 'bg-indigo-100 text-indigo-600' }
  ];
  // State for quantity per product
  const [productQuantities, setProductQuantities] = useState<{ [key: string]: number }>({});
  // Track which products are in cart (local state for HomePage)
  const [cartProducts, setCartProducts] = useState<{ [key: string]: boolean }>({});

  const handleQuantityChange = (productId: string, value: number) => {
    setProductQuantities(prev => ({ ...prev, [productId]: Math.max(1, value) }));
  };

  const handleAddToCartWithQty = (product: any) => {
    if (!product.inStock) {
      toast.error('Product is out of stock');
      return;
    }
    const quantity = productQuantities[product.id] || 1;
    onAddToCart(product, quantity);
    setCartProducts(prev => ({ ...prev, [product.id]: true }));
    toast.success(`${product.name} (x${quantity}) added to cart`);
  };

  const featuredProducts = [
    {
      id: '1',
      name: 'AB Phylline Cap',
      composition: 'Acebrophylline 100mg',
      manufacturer: 'Sun Pharma',
      mrp: 148.20,
      price: 118.56,
      discount: 20,
      rating: 4.5,
      reviews: 128,
      image: '/api/placeholder/120/120',
      inStock: true
    },
    {
      id: '5', // Using ID from mockProducts in StorePage
      name: 'Dolo 650',
      composition: 'Paracetamol 650mg',
      manufacturer: 'Micro Labs',
      mrp: 30.00,
      price: 28.50,
      discount: 5,
      rating: 4.8,
      reviews: 500,
      image: '/api/placeholder/120/120',
      inStock: true
    },
    {
      id: '9', // Using ID from mockProducts in StorePage
      name: 'Cetirizine 10mg',
      composition: 'Cetirizine 10mg',
      manufacturer: 'Dr. Reddy\'s',
      mrp: 25.00,
      price: 22.50,
      discount: 10,
      rating: 4.5,
      reviews: 180,
      image: '/api/placeholder/120/120',
      inStock: true
    },
    {
      id: '3', // Using ID from mockProducts in StorePage
      name: 'Broncho-Aid Cap',
      composition: 'Acebrophylline 100mg',
      manufacturer: 'Dr. Reddy\'s',
      mrp: 142.00,
      price: 113.60,
      discount: 20,
      rating: 4.4,
      reviews: 110,
      image: '/api/placeholder/120/120',
      inStock: false
    }
  ];

  const handleAddToCart = (product: any) => {
    if (!product.inStock) {
      toast.error('Product is out of stock');
      return;
    }
    onAddToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleProductClick = (productId: string) => {
    navigate(`/online-store/product/${productId}`);
  };

  // Updated handleCategoryClick to use category.id for navigation
  const handleCategoryClick = (categoryId: string) => {
    navigate(`/online-store/store?categoryId=${encodeURIComponent(categoryId)}`);
  };

  // Handle wishlist toggle for products on the Home Page
  const handleWishlistToggle = (productId: string, productName: string) => {
    setWishlistedProducts(prev => {
      const isCurrentlyWishlisted = !!prev[productId];
      const newState = { ...prev, [productId]: !isCurrentlyWishlisted };

      // TODO: Implement backend logic to save/remove from user's wishlist
      // For now, just update local state and show toast
      // Use a unique ID for the toast to prevent duplicates in Strict Mode
      if (!isCurrentlyWishlisted) {
        toast.success(`${productName} added to wishlist`, { id: `wishlist-${productId}` });
      } else {
        toast.success(`${productName} removed from wishlist`, { id: `wishlist-${productId}` });
      }

      return newState;
    });
  };


  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentOfferIndex((prev) => (prev + 1) % offers.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [offers.length]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner with Sliding Offers */}
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentOfferIndex * 100}%)` }}
        >
          {offers.map((offer) => (
            <div key={offer.id} className="w-full flex-shrink-0">
              <div className={`${offer.color} text-white p-6 m-4 rounded-2xl shadow-lg`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-3xl font-bold mb-1">{offer.title}</div>
                    <div className="text-lg mb-2">{offer.subtitle}</div>
                    <div className="text-sm opacity-90 mb-4">{offer.description}</div>
                    <button className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors">
                      Shop Now
                    </button>
                  </div>
                  <div className="text-6xl ml-4">{offer.image}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Offer Indicators */}
        <div className="flex justify-center space-x-2 pb-4">
          {offers.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentOfferIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentOfferIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Quick Features */}
      <div className="grid grid-cols-3 gap-4 px-4 py-4">
        <div className="bg-white p-3 rounded-lg shadow-sm text-center">
          <Truck className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <div className="text-xs font-medium text-gray-900">Free Delivery</div>
          <div className="text-xs text-gray-500">Above ₹500</div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm text-center">
          <Shield className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <div className="text-xs font-medium text-gray-900">100% Genuine</div>
          <div className="text-xs text-gray-500">Medicines</div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm text-center">
          <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <div className="text-xs font-medium text-gray-900">Quick Delivery</div>
          <div className="text-xs text-gray-500">30 mins</div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Categories</h2>
          <button
            onClick={() => navigate('/online-store/store')}
            className="text-blue-600 text-sm font-medium flex items-center"
          >
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className="bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                <span className="text-xl">{category.icon}</span>
              </div>
              <div className="text-xs font-medium text-gray-900 text-center leading-tight">
                {category.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Featured Products</h2>
          <button
            onClick={() => navigate('/online-store/store')}
            className="text-blue-600 text-sm font-medium flex items-center"
          >
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        <div className="flex space-x-4 overflow-x-auto pb-4">
          {featuredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm p-4 min-w-[160px] flex-shrink-0">
              <div className="relative">
                {/* Wishlist Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWishlistToggle(product.id, product.name);
                  }}
                  className={`absolute top-2 right-2 p-1 rounded-full bg-white bg-opacity-75 z-10 ${
                    wishlistedProducts[product.id] ? 'text-red-600' : 'text-gray-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${wishlistedProducts[product.id] ? 'fill-current' : ''}`} />
                </button>

                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-24 object-cover rounded-lg bg-gray-100"
                  onClick={() => handleProductClick(product.id)}
                />
                {product.discount > 0 && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                    <Percent className="w-3 h-3 mr-1" />
                    {product.discount}%
                  </div>
                )}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-medium">Out of Stock</span>
                  </div>
                )}
              </div>

              <div
                onClick={() => handleProductClick(product.id)}
                className="cursor-pointer mt-3"
              >
                <h3 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">
                  {product.name}
                </h3>
                <div className="text-xs text-gray-500 mb-2">{product.manufacturer}</div>
                <div className="flex items-center mb-2">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-600 ml-1">
                    {product.rating} ({product.reviews})
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-bold text-gray-900">₹{product.price}</div>
                    {product.discount > 0 && (
                      <div className="text-xs text-gray-500 line-through">₹{product.mrp}</div>
                    )}
                  </div>
                  <div className="text-xs text-green-600 font-medium">
                    Save ₹{(product.mrp - product.price).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Add to Cart button, then show pill-shaped quantity updater only after click */}
              {productQuantities[product.id] === 0 || !cartProducts[product.id] ? (
                <button
                  onClick={() => {
                    setCartProducts(prev => ({ ...prev, [product.id]: true }));
                    setProductQuantities(prev => ({ ...prev, [product.id]: 1 }));
                    handleAddToCartWithQty(product);
                  }}
                  disabled={!product.inStock}
                  className={`w-full py-2 rounded-full text-xs font-medium transition-colors mt-2 ${
                    product.inStock
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {product.inStock ? (
                    <>
                      <ShoppingCart className="w-3 h-3 inline mr-1" />
                      Add to Cart
                    </>
                  ) : (
                    'Out of Stock'
                  )}
                </button>
              ) : (
                <div className="flex items-center justify-center mt-2 w-full">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-l-full bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300"
                    onClick={() => {
                      const newQty = (productQuantities[product.id] || 1) - 1;
                      if (newQty <= 0) {
                        setProductQuantities(prev => ({ ...prev, [product.id]: 0 }));
                        setCartProducts(prev => ({ ...prev, [product.id]: false }));
                        toast.success('Removed from cart');
                      } else {
                        handleQuantityChange(product.id, newQty);
                        onAddToCart(product, newQty);
                      }
                    }}
                  >
                    -
                  </button>
                  <div className="px-4 py-2 border-t border-b border-gray-300 bg-white text-gray-900 font-semibold">
                    {productQuantities[product.id] || 1}
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-r-full bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300"
                    onClick={() => {
                      const newQty = (productQuantities[product.id] || 1) + 1;
                      handleQuantityChange(product.id, newQty);
                      onAddToCart(product, newQty);
                    }}
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Best Sellers */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Best Sellers</h2>
          <button
            onClick={() => navigate('/online-store/store?sort=bestseller')}
            className="text-blue-600 text-sm font-medium flex items-center"
          >
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        <div className="space-y-3">
          {featuredProducts.slice(0, 3).map((product, index) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm p-4 flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
              </div>

              <img
                src={product.image}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-lg bg-gray-100 flex-shrink-0"
              />

              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm text-gray-900 truncate">{product.name}</h3>
                <div className="text-xs text-gray-500">{product.manufacturer}</div>
                <div className="flex items-center mt-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-600 ml-1">{product.rating}</span>
                </div>
              </div>

              <div className="text-right flex-shrink-0 flex flex-col items-end">
                <div className="text-sm font-bold text-gray-900">₹{product.price}</div>
                {product.discount > 0 && (
                  <div className="text-xs text-gray-500 line-through">₹{product.mrp}</div>
                )}
                {/* Add to Cart button with quantity updater */}
                {productQuantities[product.id] === 0 || !cartProducts[product.id] ? (                    <button
                      onClick={() => handleAddToCartWithQty(product)}
                      disabled={!product.inStock}
                      className={`mt-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        product.inStock
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                    {product.inStock ? (
                      <>
                        <ShoppingCart className="w-3 h-3 inline mr-1" />
                        Add
                      </>
                    ) : (
                      'Out of Stock'
                    )}
                  </button>
                ) : (
                  <div className="flex items-center space-x-1 mt-2">
                    <button
                      type="button"
                      className="p-1 rounded-l-full bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300"
                      onClick={() => {
                        const newQty = (productQuantities[product.id] || 1) - 1;
                        if (newQty <= 0) {
                          setProductQuantities(prev => ({ ...prev, [product.id]: 0 }));
                          setCartProducts(prev => ({ ...prev, [product.id]: false }));
                          toast.success('Removed from cart');
                        } else {
                          handleQuantityChange(product.id, newQty);
                          handleAddToCartWithQty(product);
                        }
                      }}
                    >
                      -
                    </button>
                    <div className="px-2 py-1 border-t border-b border-gray-300 bg-white text-gray-900 text-xs font-semibold min-w-[24px] text-center">
                      {productQuantities[product.id] || 1}
                    </div>
                    <button
                      type="button"
                      className="p-1 rounded-r-full bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300"
                      onClick={() => {
                        const newQty = (productQuantities[product.id] || 1) + 1;
                        handleQuantityChange(product.id, newQty);
                        handleAddToCartWithQty(product);
                      }}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;

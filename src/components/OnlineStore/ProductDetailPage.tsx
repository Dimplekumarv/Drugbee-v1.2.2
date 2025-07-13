import React, { useState } from 'react';
import {
  ArrowLeft,
  Star,
  ShoppingCart,
  Heart, // Heart icon for wishlist
  Share2,
  Minus,
  Plus,
  Shield,
  Truck,
  RotateCcw,
  AlertTriangle,
  Info,
  Pill,
  Building2
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

interface ProductDetailPageProps {
  onAddToCart: (product: any, quantity?: number) => void;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ onAddToCart }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false); // State for wishlist status

  // Mock product data - in real app, fetch based on id
  const product = {
    id: '1',
    name: 'AB Phylline Cap',
    composition: 'Acebrophylline 100mg',
    manufacturer: 'Sun Pharma',
    category: 'Respiratory Medicine',
    mrp: 148.20,
    price: 118.56,
    discount: 20,
    rating: 4.5,
    reviews: 128,
    images: ['/api/placeholder/300/300', '/api/placeholder/300/300', '/api/placeholder/300/300'],
    inStock: true,
    stockCount: 45,
    description: 'AB Phylline Cap is a bronchodilator medication used to treat respiratory conditions such as asthma and chronic obstructive pulmonary disease (COPD). It helps to relax the muscles in the airways and improve breathing.',
    uses: [
      'Treatment of asthma',
      'Chronic obstructive pulmonary disease (COPD)',
      'Bronchitis',
      'Emphysema'
    ],
    dosage: 'Take 1 capsule twice daily or as directed by your physician. Do not exceed the recommended dose.',
    sideEffects: [
      'Nausea',
      'Headache',
      'Dizziness',
      'Stomach upset',
      'Sleep disturbances'
    ],
    storage: 'Store in a cool, dry place away from direct sunlight. Keep out of reach of children.',
    warnings: [
      'Do not use if allergic to Acebrophylline',
      'Consult doctor if pregnant or breastfeeding',
      'May cause drowsiness',
      'Avoid alcohol consumption'
    ]
  };

  // Alternative medicines with similar composition
  const alternatives = [
    {
      id: '2',
      name: 'Phylline Plus Cap',
      composition: 'Acebrophylline 100mg + Montelukast 10mg',
      manufacturer: 'Cipla',
      mrp: 165.00,
      price: 132.00,
      discount: 20,
      rating: 4.3,
      image: '/api/placeholder/80/80'
    },
    {
      id: '3',
      name: 'Broncho-Aid Cap',
      composition: 'Acebrophylline 100mg',
      manufacturer: 'Dr. Reddy\'s',
      mrp: 142.00,
      price: 113.60,
      discount: 20,
      rating: 4.4,
      image: '/api/placeholder/80/80'
    },
    {
      id: '4',
      name: 'Respicure Cap',
      composition: 'Acebrophylline 100mg',
      manufacturer: 'Lupin',
      mrp: 155.00,
      price: 124.00,
      discount: 20,
      rating: 4.2,
      image: '/api/placeholder/80/80'
    }
  ];

  const handleAddToCart = () => {
    if (!product.inStock) {
      toast.error('Product is out of stock');
      return;
    }
    onAddToCart(product, quantity);
    toast.success(`${quantity} ${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    if (!product.inStock) {
      toast.error('Product is out of stock');
      return;
    }
    onAddToCart(product, quantity);
    navigate('/online-store/cart');
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted); // Toggle wishlist state
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist'); // Show toast
    // TODO: Implement backend logic to save/remove from user's wishlist
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on PharmaCare`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            {/* Wishlist Button */}
            <button
              onClick={handleWishlist}
              className={`p-2 rounded-full ${isWishlisted ? 'text-red-600' : 'text-gray-600'}`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            {/* Share Button */}
            <button
              onClick={handleShare}
              className="p-2 text-gray-600 hover:text-gray-800"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Product Images */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <div className="relative">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-64 object-cover rounded-lg bg-gray-100"
            />
            {product.discount > 0 && (
              <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {product.discount}% OFF
              </div>
            )}
            {!product.inStock && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                <span className="text-white font-medium">Out of Stock</span>
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h1 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h1>

          <div className="flex items-center space-x-4 mb-3">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
            </div>
            <div className="text-sm text-gray-500">•</div>
            <div className="text-sm text-gray-600">{product.stockCount} in stock</div>
          </div>

          <div className="flex items-center space-x-2 mb-4">
            <Pill className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">{product.composition}</span>
          </div>

          <div className="flex items-center space-x-2 mb-6">
            <Building2 className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">by {product.manufacturer}</span>
          </div>

          {/* Pricing */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="text-2xl font-bold text-gray-900">₹{product.price}</div>
            {product.discount > 0 && (
              <>
                <div className="text-lg text-gray-500 line-through">₹{product.mrp}</div>
                <div className="text-sm font-medium text-green-600">
                  Save ₹{(product.mrp - product.price).toFixed(2)}
                </div>
              </>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center space-x-4 mb-6">
            <span className="text-sm font-medium text-gray-700">Quantity:</span>
            <div className="flex items-center border border-gray-200 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 text-gray-600 hover:text-gray-800"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 text-sm font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 text-gray-600 hover:text-gray-800"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                product.inStock
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-4 h-4 inline mr-2" />
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!product.inStock}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                product.inStock
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Buy Now
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-xs font-medium text-gray-900">100% Genuine</div>
            </div>
            <div className="text-center">
              <Truck className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-xs font-medium text-gray-900">Fast Delivery</div>
            </div>
            <div className="text-center">
              <RotateCcw className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-xs font-medium text-gray-900">Easy Returns</div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-4">
          <div className="border-b border-gray-200">
            <div className="flex">
              {[
                { id: 'description', label: 'Description' },
                { id: 'usage', label: 'Usage & Dosage' },
                { id: 'warnings', label: 'Warnings' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'description' && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">What it's used for</h3>
                <p className="text-sm text-gray-700 mb-4">{product.description}</p>

                <h4 className="font-medium text-gray-900 mb-2">Common uses:</h4>
                <ul className="space-y-1">
                  {product.uses.map((use, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-center">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                      {use}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'usage' && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Dosage & Administration</h3>
                <p className="text-sm text-gray-700 mb-4">{product.dosage}</p>

                <h4 className="font-medium text-gray-900 mb-2">Possible side effects:</h4>
                <ul className="space-y-1 mb-4">
                  {product.sideEffects.map((effect, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-center">
                      <AlertTriangle className="w-3 h-3 text-orange-500 mr-2" />
                      {effect}
                    </li>
                  ))}
                </ul>

                <h4 className="font-medium text-gray-900 mb-2">Storage:</h4>
                <p className="text-sm text-gray-700">{product.storage}</p>
              </div>
            )}

            {activeTab === 'warnings' && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Important Warnings</h3>
                <div className="space-y-3">
                  {product.warnings.map((warning, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                      <span className="text-sm text-red-800">{warning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Alternative Medicines */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Similar Medicines</h3>
          <p className="text-sm text-gray-600 mb-4">Other medicines with similar composition</p>

          <div className="space-y-4">
            {alternatives.map((alt) => (
              <div key={alt.id} className="flex items-center space-x-4 p-3 border border-gray-100 rounded-lg">
                <img
                  src={alt.image}
                  alt={alt.name}
                  className="w-16 h-16 object-cover rounded-lg bg-gray-100"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-gray-900">{alt.name}</h4>
                  <div className="text-xs text-gray-500 mb-1">{alt.manufacturer}</div>
                  <div className="text-xs text-gray-600 mb-2">{alt.composition}</div>

                  <div className="flex items-center space-x-2">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-xs text-gray-600">{alt.rating}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">₹{alt.price}</div>
                  {alt.discount > 0 && (
                    <div className="text-xs text-gray-500 line-through">₹{alt.mrp}</div>
                  )}
                  <button
                    onClick={() => navigate(`/online-store/product/${alt.id}`)}
                    className="text-xs text-blue-600 font-medium mt-1"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;

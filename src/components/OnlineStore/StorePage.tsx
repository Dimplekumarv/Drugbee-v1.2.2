import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowLeft, Star, Heart, Plus, Minus, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { Product } from '../../types'; // Assuming Product type is defined

// Mock product data - replace with API call
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'AB Phylline Cap',
    genericName: 'Acebrophylline',
    composition: 'Acebrophylline 100mg',
    manufacturer: 'Sun Pharma',
    category: 'Respiratory Medicine',
    tags: ['asthma', 'bronchitis'],
    scheduleType: 'H',
    mrp: 148.20,
    price: 118.56,
    stock: 45,
    minStock: 10,
    batch: 'BATCH001',
    expiryDate: new Date('2025-12-31'),
    description: 'Used for respiratory conditions.',
    images: ['/api/placeholder/150/150'],
    isActive: true,
    packUnits: '1x10',
    hsnCode: '3004',
    createdAt: new Date(),
    updatedAt: new Date(),
    rating: 4.5, // Added for mock data
    reviews: 128, // Added for mock data
  },
  {
    id: '2',
    name: 'Phylline Plus Cap',
    genericName: 'Acebrophylline + Montelukast',
    composition: 'Acebrophylline 100mg + Montelukast 10mg',
    manufacturer: 'Cipla',
    category: 'Respiratory Medicine',
    tags: ['asthma', 'allergy'],
    scheduleType: 'H',
    mrp: 165.00,
    price: 132.00,
    stock: 20,
    minStock: 5,
    batch: 'BATCH002',
    expiryDate: new Date('2026-01-15'),
    description: 'Combination for asthma and allergy.',
    images: ['/api/placeholder/150/150'],
    isActive: true,
    packUnits: '1x10',
    hsnCode: '3004',
    createdAt: new Date(),
    updatedAt: new Date(),
    rating: 4.3, // Added for mock data
    reviews: 95, // Added for mock data
  },
  {
    id: '3',
    name: 'Broncho-Aid Cap',
    genericName: 'Acebrophylline',
    composition: 'Acebrophylline 100mg',
    manufacturer: 'Dr. Reddy\'s',
    category: 'Respiratory Medicine',
    tags: ['bronchitis'],
    scheduleType: 'H',
    mrp: 142.00,
    price: 113.60,
    stock: 0, // Example out of stock
    minStock: 5,
    batch: 'BATCH003',
    expiryDate: new Date('2025-11-20'),
    description: 'Aids in bronchodilation.',
    images: ['/api/placeholder/150/150'],
    isActive: true,
    packUnits: '1x10',
    hsnCode: '3004',
    createdAt: new Date(),
    updatedAt: new Date(),
    rating: 4.4, // Added for mock data
    reviews: 110, // Added for mock data
  },
  {
    id: '4',
    name: 'Respicure Cap',
    genericName: 'Acebrophylline',
    composition: 'Acebrophylline 100mg',
    manufacturer: 'Lupin',
    category: 'Respiratory Medicine',
    tags: ['asthma'],
    scheduleType: 'H',
    mrp: 155.00,
    price: 124.00,
    stock: 30,
    minStock: 8,
    batch: 'BATCH004',
    expiryDate: new Date('2026-03-10'),
    description: 'Helps in breathing difficulties.',
    images: ['/api/placeholder/150/150'],
    isActive: true,
    packUnits: '1x10',
    hsnCode: '3004',
    createdAt: new Date(),
    updatedAt: new Date(),
    rating: 4.2, // Added for mock data
    reviews: 88, // Added for mock data
  },
  {
    id: '5',
    name: 'Dolo 650',
    genericName: 'Paracetamol',
    composition: 'Paracetamol 650mg',
    manufacturer: 'Micro Labs',
    category: 'Pain Relief',
    tags: ['fever', 'headache'],
    scheduleType: 'OTC',
    mrp: 30.00,
    price: 28.50,
    stock: 200,
    minStock: 50,
    batch: 'BATCH005',
    expiryDate: new Date('2025-08-01'),
    description: 'Common pain reliever and fever reducer.',
    images: ['/api/placeholder/150/150'],
    isActive: true,
    packUnits: '1x15',
    hsnCode: '3004',
    createdAt: new Date(),
    updatedAt: new Date(),
    rating: 4.8, // Added for mock data
    reviews: 500, // Added for mock data
  },
  {
    id: '6',
    name: 'Allegra 120mg',
    genericName: 'Fexofenadine',
    composition: 'Fexofenadine 120mg',
    manufacturer: 'Sanofi India',
    category: 'Allergy Relief',
    tags: ['allergy', 'antihistamine'],
    scheduleType: 'OTC',
    mrp: 210.00,
    price: 189.00,
    stock: 80,
    minStock: 20,
    batch: 'BATCH006',
    expiryDate: new Date('2026-05-25'),
    description: 'Non-drowsy allergy relief.',
    images: ['/api/placeholder/150/150'],
    isActive: true,
    packUnits: '1x10',
    hsnCode: '3004',
    createdAt: new Date(),
    updatedAt: new Date(),
    rating: 4.6, // Added for mock data
    reviews: 350, // Added for mock data
  },
  {
    id: '7',
    name: 'Omeprazole 20mg',
    genericName: 'Omeprazole',
    composition: 'Omeprazole 20mg',
    manufacturer: 'Dr. Reddy\'s',
    category: 'Digestive Health',
    tags: ['acidity', 'GERD'],
    scheduleType: 'H',
    mrp: 50.00,
    price: 45.00,
    stock: 120,
    minStock: 30,
    batch: 'BATCH007',
    expiryDate: new Date('2025-09-18'),
    description: 'Reduces stomach acid production.',
    images: ['/api/placeholder/150/150'],
    isActive: true,
    packUnits: '1x15',
    hsnCode: '3004',
    createdAt: new Date(),
    updatedAt: new Date(),
    rating: 4.4, // Added for mock data
    reviews: 150, // Added for mock data
  },
  {
    id: '8',
    name: 'Amoxicillin 500mg',
    genericName: 'Amoxicillin',
    composition: 'Amoxicillin 500mg',
    manufacturer: 'Cipla',
    category: 'Antibiotics',
    tags: ['infection'],
    scheduleType: 'H',
    mrp: 80.00,
    price: 72.00,
    stock: 90,
    minStock: 25,
    batch: 'BATCH008',
    expiryDate: new Date('2025-10-05'),
    description: 'Broad-spectrum antibiotic.',
    images: ['/api/placeholder/150/150'],
    isActive: true,
    packUnits: '1x10',
    hsnCode: '3004',
    createdAt: new Date(),
    updatedAt: new Date(),
    rating: 4.7, // Added for mock data
    reviews: 250, // Added for mock data
  },
  {
    id: '9',
    name: 'Cetirizine 10mg',
    genericName: 'Cetirizine',
    composition: 'Cetirizine 10mg',
    manufacturer: 'Dr. Reddy\'s',
    category: 'Allergy Relief',
    tags: ['allergy'],
    scheduleType: 'OTC',
    mrp: 25.00,
    price: 22.50,
    stock: 150,
    minStock: 40,
    batch: 'BATCH009',
    expiryDate: new Date('2026-02-14'),
    description: 'Relieves allergy symptoms.',
    images: ['/api/placeholder/150/150'],
    isActive: true,
    packUnits: '1x10',
    hsnCode: '3004',
    createdAt: new Date(),
    updatedAt: new Date(),
    rating: 4.5, // Added for mock data
    reviews: 180, // Added for mock data
  },
  {
    id: '10',
    name: 'Ibuprofen 400mg',
    genericName: 'Ibuprofen',
    composition: 'Ibuprofen 400mg',
    manufacturer: 'Abbott',
    category: 'Pain Relief',
    tags: ['pain', 'inflammation'],
    scheduleType: 'OTC',
    mrp: 40.00,
    price: 38.00,
    stock: 180,
    minStock: 50,
    batch: 'BATCH010',
    expiryDate: new Date('2025-07-22'),
    description: 'Reduces pain and inflammation.',
    images: ['/api/placeholder/150/150'],
    isActive: true,
    packUnits: '1x10',
    hsnCode: '3004',
    createdAt: new Date(),
    updatedAt: new Date(),
    rating: 4.6, // Added for mock data
    reviews: 300, // Added for mock data
  },
];

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

interface StorePageProps {
  onAddToCart: (product: Product, quantity?: number) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  cartItems: CartItem[];
}


const StorePage: React.FC<StorePageProps> = ({ onAddToCart, onUpdateQuantity, onRemoveItem, cartItems }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryId = queryParams.get('categoryId');

  const [products, setProducts] = useState(mockProducts); // Use mock data initially
  const [searchTerm, setSearchTerm] = useState(''); // State for input value
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryId);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // State to track wishlisted status for each product locally
  const [wishlistedProducts, setWishlistedProducts] = useState<{ [key: string]: boolean }>({});

  // Dynamically get unique categories from mock data
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    mockProducts.forEach(product => categories.add(product.category));
    return ['All', ...Array.from(categories).sort()];
  }, []);


  useEffect(() => {
    // Filter mock data based on searchTerm and selectedCategory
    const filtered = mockProducts.filter(product => {
      const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
      const matchesSearch = searchTerm
        ? product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.composition.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.genericName.toLowerCase().includes(searchTerm.toLowerCase())
        : true; // If searchTerm is empty, all products match search
      return matchesCategory && matchesSearch;
    });
    setProducts(filtered);
  }, [searchTerm, selectedCategory]); // Dependencies updated to use searchTerm for live filtering

  useEffect(() => {
    // Initialize wishlisted state from local storage or API if available
    // For this example, it starts empty
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value); // Update searchTerm as user types (triggers live filter via useEffect)
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    // Update URL query param
    if (category) {
      navigate(`?categoryId=${category}`);
    } else {
      navigate('.'); // Remove query param
    }
    setShowFilterModal(false);
  };

  const handleProductClick = (productId: string) => {
    navigate(`/online-store/product/${productId}`);
  };

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

  const handleFilterClick = () => {
    setShowFilterModal(true);
  };

  const getCartItem = (productId: string) => {
    return cartItems.find(item => item.productId === productId);
  };

  const handleAddToCartClick = (product: Product) => {
    onAddToCart(product, 1); // Add 1 quantity by default
    toast.success(`${product.name} added to cart`);
  };

  const handleUpdateCartQuantity = (cartItemId: string, newQuantity: number, productName: string) => {
    if (newQuantity <= 0) {
      onRemoveItem(cartItemId);
      toast.success(`${productName} removed from cart`);
    } else {
      onUpdateQuantity(cartItemId, newQuantity);
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
          <h1 className="text-lg font-semibold text-gray-900">Online Store</h1>
          <div className="w-5 h-5"></div> {/* Placeholder for alignment */}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="p-4 bg-white shadow-sm mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search medicines..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={handleSearchChange} // Live filtering happens here via useEffect
            />
          </div>
          <button
            onClick={handleFilterClick}
            className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.length > 0 ? (
          products.map((product) => {
            const cartItem = getCartItem(product.id);
            const isInStock = product.stock > 0;

            return (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="relative">
                   {/* Wishlist Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering product click
                      handleWishlistToggle(product.id, product.name);
                    }}
                    className={`absolute top-2 right-2 p-1 rounded-full bg-white bg-opacity-75 z-10 ${
                      wishlistedProducts[product.id] ? 'text-red-600' : 'text-gray-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${wishlistedProducts[product.id] ? 'fill-current' : ''}`} />
                  </button>

                  <img
                    src={product.images[0] || '/api/placeholder/150/150'} // Use first image or placeholder
                    alt={product.name}
                    className="w-full h-32 object-cover bg-gray-100"
                    onClick={() => handleProductClick(product.id)}
                  />
                  {product.discount > 0 && ( // Assuming discount can be calculated from mrp and price
                    <div className="absolute bottom-0 left-0 bg-green-500 text-white text-xs px-2 py-1 rounded-tr-lg font-medium">
                      {(((product.mrp - product.price) / product.mrp) * 100).toFixed(0)}% OFF
                    </div>
                  )}
                   {!isInStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Out of Stock</span>
                    </div>
                  )}
                </div>
                <div className="p-3 flex-grow flex flex-col" onClick={() => handleProductClick(product.id)}>
                  <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
                  <p className="text-xs text-gray-500 truncate mb-2">{product.composition}</p>
                  <div className="flex items-center space-x-1 text-xs text-gray-600 mb-2">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span>{product.rating?.toFixed(1) || 'N/A'} ({product.reviews || 0})</span> {/* Use optional chaining */}
                  </div>
                  <div className="flex items-baseline space-x-1 mb-3">
                    <div className="text-sm font-bold text-gray-900">₹{product.price.toFixed(2)}</div>
                    {product.mrp > product.price && (
                      <div className="text-xs text-gray-500 line-through">₹{product.mrp.toFixed(2)}</div>
                    )}
                  </div>

                  {/* Add to Cart / Quantity Adjuster */}
                  <div className="mt-auto"> {/* Push to bottom */}
                    {isInStock ? (
                      cartItem ? (
                        // Item is in cart, show quantity adjuster
                        <div className="flex items-center justify-between border border-gray-300 rounded-lg overflow-hidden">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateCartQuantity(cartItem.id, cartItem.quantity - 1, product.name);
                            }}
                            className="p-2 text-gray-600 hover:bg-gray-100"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-3 text-sm font-medium">{cartItem.quantity}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateCartQuantity(cartItem.id, cartItem.quantity + 1, product.name);
                            }}
                            className="p-2 text-gray-600 hover:bg-gray-100"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        // Item not in cart, show Add to Cart button
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCartClick(product);
                          }}
                          className="w-full bg-blue-600 text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center space-x-1 hover:bg-blue-700 transition-colors"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>Add to Cart</span>
                        </button>
                      )
                    ) : (
                      // Out of stock message
                      <div className="w-full bg-gray-200 text-gray-600 text-sm font-medium py-2 rounded-lg text-center">
                        Out of Stock
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center text-gray-600 py-8">No products found matching your criteria.</div>
        )}
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white rounded-xl shadow-lg p-6 w-11/12 max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter by Category</h2>
            <div className="space-y-3 max-h-60 overflow-y-auto"> {/* Added max-height and overflow */}
              {availableCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat === 'All' ? null : cat)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    (selectedCategory === cat || (selectedCategory === null && cat === 'All'))
                      ? 'bg-blue-100 text-blue-800 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="mt-6 text-right">
              <button
                onClick={() => setShowFilterModal(false)}
                className="px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorePage;

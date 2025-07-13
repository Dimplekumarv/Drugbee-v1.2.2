import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Package, AlertTriangle } from 'lucide-react';
import { Product } from '../../types';
import { searchProducts } from '../../utils/productSearch';

interface ProductQuickSearchProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

const ProductQuickSearch: React.FC<ProductQuickSearchProps> = ({
  products,
  onProductSelect,
  placeholder = "Search products...",
  className = "",
  autoFocus = false
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    
    if (value.length >= 1) {
      const results = searchProducts(value, products, {
        limit: 10,
        includeOutOfStock: true
      });
      setSuggestions(results);
      setIsOpen(true);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleProductSelect(suggestions[selectedIndex]);
        }
        break;
      
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleProductSelect = (product: Product) => {
    onProductSelect(product);
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 1 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
        />
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 mt-1 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">
                <Package className="w-4 h-4 inline mr-2" />
                Found {suggestions.length} products
              </h4>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="py-2">
            {suggestions.map((product, index) => {
              const stockStatus = product.stock <= 0 ? 'out-of-stock' : 
                                product.stock <= product.minStock ? 'low-stock' : 'in-stock';
              const expiryStatus = product.expiryDate ? 
                (new Date(product.expiryDate) < new Date() ? 'expired' : 
                 new Date(product.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'near-expiry' : 'good') : 'good';
              
              return (
                <button
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                    selectedIndex === index 
                      ? 'bg-blue-100 border-l-4 border-blue-500' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        {product.scheduleType && (
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            product.scheduleType === 'H' ? 'bg-red-100 text-red-700' :
                            product.scheduleType === 'H1' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {product.scheduleType}
                          </span>
                        )}
                        {stockStatus === 'out-of-stock' && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-600 mb-2">{product.composition}</div>
                      
                      <div className="flex items-center flex-wrap gap-2 text-xs">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          HSN: {product.hsnCode}
                        </span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                          Pack: {product.packUnits}
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          MRP: ₹{product.mrp.toFixed(2)}
                        </span>
                        {product.price && product.price !== product.mrp && (
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                            Rate: ₹{product.price.toFixed(2)}
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded font-medium ${
                          stockStatus === 'out-of-stock' ? 'bg-red-100 text-red-800' :
                          stockStatus === 'low-stock' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          Stock: {product.stock}
                        </span>
                        {expiryStatus === 'expired' && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded font-medium">
                            Expired
                          </span>
                        )}
                        {expiryStatus === 'near-expiry' && (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-medium">
                            Near Expiry
                          </span>
                        )}
                      </div>
                      
                      <div className="text-xs text-blue-600 mt-2 font-medium">
                        {product.manufacturer}
                      </div>
                      {product.category && (
                        <div className="text-xs text-gray-500 mt-1">
                          Category: {product.category}
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-3 text-right flex flex-col items-end">
                      <div className="text-xs text-gray-500 mb-1">Available</div>
                      <div className={`text-sm font-bold ${
                        stockStatus === 'out-of-stock' ? 'text-red-600' :
                        stockStatus === 'low-stock' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {product.stock} units
                      </div>
                      {product.expiryDate && (
                        <div className="text-xs text-gray-500 mt-1">
                          Exp: {new Date(product.expiryDate).toLocaleDateString('en-IN')}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && query.length >= 1 && suggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 mt-1">
          <div className="p-4 text-center text-gray-500">
            <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No products found for "{query}"</p>
            <p className="text-xs text-gray-400 mt-1">
              Try searching with different keywords or check spelling
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductQuickSearch;
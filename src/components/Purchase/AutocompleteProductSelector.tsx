import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { Product } from '../../types';

interface AutocompleteProductSelectorProps {
  onProductSelect: (product: Product) => void;
  className?: string;
  placeholder?: string;
}

const AutocompleteProductSelector: React.FC<AutocompleteProductSelectorProps> = ({
  onProductSelect,
  className = '',
  placeholder = 'Search products...',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchProducts = async () => {
      if (searchTerm.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, generic_name, composition, manufacturer, category, tags, schedule_type, price, mrp, min_stock, batch, expiry_date, description, images, is_active, pack_units, hsn_code, gst_percentage, created_at, updated_at')
          .or(`name.ilike.%${searchTerm}%, composition.ilike.%${searchTerm}%, manufacturer.ilike.%${searchTerm}%`)
          .limit(10);

        if (error) {
          console.error('Error fetching products:', error);
          return;
        }

        setSuggestions(data || []);
        setIsOpen(true);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimeout = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

  const handleSelect = (product: Product) => {
    setSearchTerm(product.name);
    onProductSelect(product);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
        />
        <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
      </div>

      {isOpen && (suggestions.length > 0 || isLoading) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
          ) : (
            <div className="max-h-60 overflow-y-auto">
              {suggestions.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSelect(product)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 focus:bg-gray-50 outline-none"
                >
                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  <div className="text-xs text-gray-500">{product.composition}</div>
                  <div className="mt-1 flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {product.manufacturer} • Pack: {product.pack_units}
                    </div>
                    <div className="text-xs font-medium text-gray-900">
                      MRP: ₹{product.mrp}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutocompleteProductSelector;

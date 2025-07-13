import React from 'react';
import { Product } from '../../types';
import { Calendar, Package, AlertTriangle } from 'lucide-react';

interface BatchSelectorProps {
  fetchProducts: (query: string) => Promise<Product[]>;
  productName: string;
  selectedBatch?: string;
  onBatchSelect: (product: Product) => void;
}

const BatchSelector: React.FC<BatchSelectorProps> = ({
  fetchProducts,
  productName,
  selectedBatch,
  onBatchSelect
}) => {
  const [matchingProducts, setMatchingProducts] = React.useState<Product[]>([]);

  React.useEffect(() => {
    const loadProducts = async () => {
      if (productName.length >= 2) {
        const products = await fetchProducts(productName);
        setMatchingProducts(products);
      } else {
        setMatchingProducts([]);
      }
    };
    loadProducts();
  }, [fetchProducts, productName]);

  if (matchingProducts.length === 0) {
    return null;
  }

  const isExpired = (expiryDate: string) => {
    return new Date() > new Date(expiryDate);
  };

  const isNearExpiry = (expiryDate: string) => {
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    const expiryDateTime = new Date(expiryDate);
    return expiryDateTime <= threeMonthsFromNow && expiryDateTime > new Date();
  };

  return (
    <div className="mt-2 border border-gray-200 rounded-lg p-3 bg-gray-50">
      <h4 className="text-sm font-medium text-gray-700 mb-2">
        Available Batches for "{productName}"
      </h4>
      
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {matchingProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => onBatchSelect(product)}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedBatch === product.batch
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-sm">{product.name}</span>
                  {isExpired(product.expiry_date) && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      Expired
                    </span>
                  )}
                  {isNearExpiry(product.expiry_date) && !isExpired(product.expiry_date) && (
                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                      Near Expiry
                    </span>
                  )}
                </div>
                
                <div className="mt-1 text-xs text-gray-600 space-y-1">
                  <div className="flex items-center space-x-4">
                    <span>Batch: {product.batch}</span>
                    <span>Stock: {product.min_stock}</span>
                    <span>HSN: {product.hsn_code}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3" />
                    <span>Expiry: {new Date(product.expiry_date).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span>MRP: ₹{product.mrp}</span>
                    <span>Price: ₹{product.price}</span>
                    <span>Pack: {product.pack_units}</span>
                  </div>
                </div>
              </div>
              
              {(isExpired(product.expiry_date) || isNearExpiry(product.expiry_date)) && (
                <AlertTriangle className="w-4 h-4 text-orange-500 ml-2" />
              )}
            </div>
          </div>
        ))}
      </div>
      
      {matchingProducts.length > 1 && (
        <div className="mt-2 text-xs text-gray-500">
          {matchingProducts.length} batches available. Select the appropriate batch for purchase entry.
        </div>
      )}
    </div>
  );
};

export default BatchSelector;

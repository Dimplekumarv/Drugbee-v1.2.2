import { Product } from '../types';

// Simple but effective product search utility
export const searchProducts = (query: string, products: Product[], options: {
  limit?: number;
  includeOutOfStock?: boolean;
  category?: string;
  manufacturer?: string;
} = {}): Product[] => {
  const {
    limit = 10,
    includeOutOfStock = true,
    category,
    manufacturer
  } = options;

  if (!query || query.length < 1) return [];

  const normalizedQuery = query.toLowerCase().trim();
  
  // Filter and score products
  const scoredProducts = products
    .filter(product => {
      if (!product.isActive) return false;
      if (!includeOutOfStock && product.stock <= 0) return false;
      if (category && product.category !== category) return false;
      if (manufacturer && product.manufacturer !== manufacturer) return false;
      return true;
    })
    .map(product => {
      let score = 0;
      
      // Exact name match gets highest score
      if (product.name.toLowerCase() === normalizedQuery) {
        score += 100;
      }
      
      // Name starts with query
      if (product.name.toLowerCase().startsWith(normalizedQuery)) {
        score += 80;
      }
      
      // Name contains query
      if (product.name.toLowerCase().includes(normalizedQuery)) {
        score += 60;
      }
      
      // Generic name matches
      if (product.genericName.toLowerCase().includes(normalizedQuery)) {
        score += 50;
      }
      
      // Composition matches
      if (product.composition.toLowerCase().includes(normalizedQuery)) {
        score += 40;
      }
      
      // Manufacturer matches
      if (product.manufacturer.toLowerCase().includes(normalizedQuery)) {
        score += 30;
      }
      
      // HSN code matches
      if (product.hsnCode.includes(normalizedQuery.replace(/\s/g, ''))) {
        score += 25;
      }
      
      // Barcode match (if exists)
      if (product.barcode && product.barcode.includes(normalizedQuery)) {
        score += 90;
      }
      
      // Tag matches
      product.tags.forEach(tag => {
        if (tag.toLowerCase().includes(normalizedQuery)) {
          score += 20;
        }
      });
      
      // Category matches
      if (product.category.toLowerCase().includes(normalizedQuery)) {
        score += 15;
      }
      
      // Boost score for products with good stock
      if (product.stock > product.minStock) {
        score += 5;
      }
      
      return { product, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scoredProducts.map(item => item.product);
};

// Search by barcode specifically
export const searchByBarcode = (barcode: string, products: Product[]): Product | null => {
  const product = products.find(p => 
    p.isActive && 
    p.barcode && 
    p.barcode === barcode
  );
  return product || null;
};

// Get product suggestions for autocomplete
export const getProductSuggestions = (query: string, products: Product[], limit: number = 5): string[] => {
  if (!query || query.length < 2) return [];

  const normalizedQuery = query.toLowerCase();
  const suggestions = new Set<string>();

  products.forEach(product => {
    if (!product.isActive) return;

    if (product.name.toLowerCase().startsWith(normalizedQuery)) {
      suggestions.add(product.name);
    } else if (product.genericName.toLowerCase().startsWith(normalizedQuery)) {
      suggestions.add(product.genericName);
    }
  });

  return Array.from(suggestions).slice(0, limit);
};

// Check if input looks like a barcode
export const isBarcode = (input: string): boolean => {
  return /^\d{8,}$/.test(input.replace(/\s/g, ''));
};

// Get products by category
export const getProductsByCategory = (category: string, products: Product[]): Product[] => {
  return products.filter(product => 
    product.isActive && 
    product.category.toLowerCase() === category.toLowerCase()
  );
};

// Get products by manufacturer
export const getProductsByManufacturer = (manufacturer: string, products: Product[]): Product[] => {
  return products.filter(product => 
    product.isActive && 
    product.manufacturer.toLowerCase() === manufacturer.toLowerCase()
  );
};

// Get low stock products
export const getLowStockProducts = (products: Product[]): Product[] => {
  return products.filter(product => 
    product.isActive && 
    product.stock <= product.minStock
  );
};

// Get expiring products
export const getExpiringProducts = (products: Product[], days: number = 30): Product[] => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + days);

  return products.filter(product => 
    product.isActive && 
    product.expiryDate && 
    new Date(product.expiryDate) <= cutoffDate
  );
};
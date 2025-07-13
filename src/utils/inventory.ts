import { Product, Sale, Order } from '../types';

export const updateInventoryOnSale = (products: Product[], sale: Sale): Product[] => {
  return products.map(product => {
    const saleItem = sale.items.find(item => item.productId === product.id);
    if (saleItem) {
      return {
        ...product,
        stock: Math.max(0, product.stock - saleItem.quantity),
        updatedAt: new Date()
      };
    }
    return product;
  });
};

export const updateInventoryOnOrder = (products: Product[], order: Order): Product[] => {
  return products.map(product => {
    const orderItem = order.items.find(item => item.productId === product.id);
    if (orderItem) {
      return {
        ...product,
        stock: Math.max(0, product.stock - orderItem.quantity),
        updatedAt: new Date()
      };
    }
    return product;
  });
};

export const findProductByNameAndBatch = (products: Product[], name: string, batch?: string): Product | null => {
  return products.find(product => {
    const nameMatch = product.name.toLowerCase().includes(name.toLowerCase()) ||
                     product.genericName.toLowerCase().includes(name.toLowerCase());
    const batchMatch = !batch || product.batch === batch;
    return nameMatch && batchMatch;
  }) || null;
};

export const getProductSuggestions = (products: Product[], searchTerm: string): Product[] => {
  return products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.composition.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 10);
};

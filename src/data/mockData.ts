import { User, Product, Sale, Purchase, Order, Composition } from '../types';
import { inventoryProducts, purchaseHistory } from './inventoryData';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@pharmacy.com',
    phone: '+91-9876543210',
    name: 'Admin User',
    role: 'admin',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    email: 'sales@pharmacy.com',
    phone: '+91-9876543211',
    name: 'Sales Team',
    role: 'team',
    permissions: [{ module: 'sales', access: 'full' }],
    isActive: true,
    createdAt: new Date('2024-01-02')
  },
  {
    id: '3',
    email: 'purchase@pharmacy.com',
    phone: '+91-9876543212',
    name: 'Purchase Team',
    role: 'team',
    permissions: [{ module: 'purchase', access: 'full' }],
    isActive: true,
    createdAt: new Date('2024-01-03')
  },
  {
    id: '4',
    email: 'inventory@pharmacy.com',
    phone: '+91-9876543213',
    name: 'Inventory Team',
    role: 'team',
    permissions: [{ module: 'inventory', access: 'full' }],
    isActive: true,
    createdAt: new Date('2024-01-04')
  }
];

export const mockCompositions: Composition[] = [
  { id: '1', name: 'Paracetamol', strength: '500', unit: 'mg' },
  { id: '2', name: 'Paracetamol', strength: '650', unit: 'mg' },
  { id: '3', name: 'Amoxicillin', strength: '250', unit: 'mg' },
  { id: '4', name: 'Amoxicillin', strength: '500', unit: 'mg' },
  { id: '5', name: 'Cetirizine', strength: '10', unit: 'mg' },
  { id: '6', name: 'Omeprazole', strength: '20', unit: 'mg' },
  { id: '7', name: 'Metformin', strength: '500', unit: 'mg' },
  { id: '8', name: 'Atorvastatin', strength: '10', unit: 'mg' },
  { id: '9', name: 'Amlodipine', strength: '5', unit: 'mg' },
  { id: '10', name: 'Losartan', strength: '50', unit: 'mg' },
  { id: '11', name: 'Acebrophylline', strength: '100', unit: 'mg' },
  { id: '12', name: 'Aceclofenac', strength: '100', unit: 'mg' },
  { id: '13', name: 'Aceclofenac', strength: '200', unit: 'mg' },
  { id: '14', name: 'Serratiopeptidase', strength: '15', unit: 'mg' }
];

// Use inventory products from inventoryData
export const mockProducts: Product[] = inventoryProducts;

export const mockSales: Sale[] = [
  {
    id: '1',
    customerId: 'c1',
    customerName: 'John Doe',
    customerPhone: '+91-9876543220',
    customerAddress: 'Sector 6, HSR Layout, Bengaluru, Karnataka',
    items: [
      {
        productId: '1',
        productName: 'AB PHYLLINE CAP',
        quantity: 2,
        price: 148.20,
        discount: 0,
        total: 296.40,
        batch: 'GTC2188A',
        expiryDate: new Date('2023-10-31'),
        hsnCode: '3004',
        packUnits: '1x10',
        cgst: 6,
        sgst: 6
      }
    ],
    subtotal: 296.40,
    discount: 0,
    tax: 35.57,
    total: 331.97,
    paymentMethod: 'cash',
    status: 'completed',
    createdBy: '2',
    createdAt: new Date('2024-01-15'),
    billNumber: 'DHS-2024-001',
    doctorName: 'Dr. Ramesh Goyal',
    gstNumber: '29ABYPB7940B1ZF'
  }
];

// Use purchase history from inventoryData
export const mockPurchases: Purchase[] = purchaseHistory;

export const mockOrders: Order[] = [
  {
    id: '1',
    customerId: 'c1',
    customerName: 'Jane Smith',
    customerPhone: '+91-9876543240',
    items: [
      {
        productId: '2',
        productName: 'ACECLO PLUS TAB',
        quantity: 1,
        price: 90.85,
        total: 90.85
      },
      {
        productId: '5',
        productName: 'ACEMIZ 100MG TAB',
        quantity: 1,
        price: 73.65,
        total: 73.65
      }
    ],
    subtotal: 164.50,
    deliveryCharge: 30.00,
    total: 194.50,
    status: 'pending',
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    deliveryAddress: '123 Main St, City, State - 123456',
    notes: 'Please deliver in evening',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  }
];

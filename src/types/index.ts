export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: 'admin' | 'team' | 'customer';
  permissions?: Permission[];
  isActive: boolean;
  createdAt: Date;
  // Added fields for online store profile
  govtDocumentType?: 'Aadhaar' | 'Voter ID' | 'Driving Licence' | null;
  govtIdNumber?: string | null;
  govtDocumentUrl?: string | null; // URL or reference to the uploaded document
  addresses?: Address[]; // Added addresses array
}

export interface Address {
  id: string;
  label: string;
  address: string;
  isDefault: boolean;
}

export interface Permission {
  module: 'sales' | 'purchase' | 'inventory' | 'orders';
  access: 'read' | 'write' | 'full';
}

export interface Product {
  id: string;
  name: string;
  generic_name: string;
  composition: string;
  manufacturer: string;
  category: string;
  tags: string[];
  schedule_type: 'H' | 'X' | 'OTC';
  price: number;
  mrp: number;
  min_stock: number;
  batch: string;
  expiry_date: string;
  description: string;
  images: string[];
  is_active: boolean;
  pack_units: string;
  hsn_code: string;
  gst_percentage: number;
  created_at?: string;
  updated_at?: string;
}

export interface PurchaseItem {
  sku: string | undefined;
  id?: string;
  product_id: string;
  product_name?: string;
  batch: string;
  quantity: number;
  price: number;
  mrp: number;
  expiry_date: string;
  expiryDisplayValue?: string;
  gst_percentage: number;
  discount?: number;
  total: number;
  hsn_code?: string;
  pack_units?: string;
  cgst?: number;
  sgst?: number;
  free_quantity?: number;
  scheme?: string | null;
  scheme_percentage?: number;
}

export interface Purchase {
  id?: string;
  vendor_id: number;
  vendor_name?: string;
  invoice_number: string;
  invoice_date: string;
  items: PurchaseItem[];
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'partial' | 'completed';
  payment_method?: string;
  remarks?: string;
  created_at?: string;
  updated_at?: string;
  gst_number?: string;
  created_by?: string;
}

export interface Vendor {
  id: number;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
  gst_number?: string;
  drug_license?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Composition {
  id: string;
  name: string;
  strength: string;
  unit: string;
}

export interface SaleItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
  batch: string;
  expiry_date: string;
  hsn_code: string;
  pack_units: string;
  cgst: number;
  sgst: number;
}

export interface Sale {
  id: string;
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment_method: 'cash' | 'card' | 'upi' | 'online';
  status: 'completed' | 'refunded';
  created_by: string;
  created_at: string;
  bill_number: string;
  doctor_name?: string;
  gst_number?: string;
  follow_up_date?: string;
  follow_up_notes?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  status: 'pending' | 'approved' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cod' | 'online';
  paymentStatus: 'pending' | 'paid';
  deliveryAddress: string;
  prescriptionUrl?: string;
  notes?: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  substituteFor?: string;
}

export interface Inventory {
  productId: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  lastUpdated: Date;
  movements: StockMovement[];
}

export interface StockMovement {
  id: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  reference: string;
  createdBy: string;
  createdAt: Date;
}

export interface FollowUpCustomer {
  id: string;
  customerName: string;
  phone: string;
  followUpDate: Date;
  medicines: string[];
  lastPurchaseDate: Date;
  totalAmount: number;
  status: 'pending' | 'contacted' | 'completed';
  saleId: string;
  notes?: string;
}

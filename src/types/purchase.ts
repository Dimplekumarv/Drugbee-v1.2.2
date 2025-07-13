export interface PurchaseItem {
  id?: string;
  product_id: string;
  product_name: string;
  batch: string;
  quantity: number;
  price: number;
  mrp: number;
  expiry_date: string;
  gst_percentage: number;
  discount?: number;
  total: number;
  hsn_code: string;
  pack_units: string;
  cgst: number;
  sgst: number;
  free_quantity: number;
  scheme: string | null;
  scheme_percentage: number;
  sku?: string;
}

export interface Purchase {
  id?: string;
  vendor_id: number;
  invoice_number: string;
  invoice_date: string;
  total_amount: number;
  items: PurchaseItem[];
  status: 'pending' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'partial' | 'completed';
  payment_method?: string;
  remarks?: string;
  created_at?: string;
  updated_at?: string;
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

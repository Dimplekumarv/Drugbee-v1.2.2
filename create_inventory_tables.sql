-- Create all missing tables for the pharmacy management system
-- Run this SQL in your Supabase SQL editor

-- First, create products table if it doesn't exist
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    generic_name TEXT,
    composition TEXT,
    manufacturer TEXT,
    category TEXT,
    hsn_code TEXT,
    pack_units TEXT,
    schedule_type TEXT,
    description TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    mrp NUMERIC(10,2),
    gst_percentage NUMERIC DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    images TEXT[],
    tags TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create vendors table if it doesn't exist
CREATE TABLE IF NOT EXISTS vendors (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    zip TEXT,
    gst_number TEXT,
    drug_license TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create purchases table if it doesn't exist
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id INTEGER REFERENCES vendors(id),
    vendor_name TEXT NOT NULL,
    invoice_number TEXT NOT NULL,
    invoice_date TIMESTAMP NOT NULL,
    payment_due_date TIMESTAMP,
    purchase_type TEXT CHECK (purchase_type IN ('invoice', 'delivery_challan')),
    subtotal NUMERIC(10,2) NOT NULL,
    tax NUMERIC(10,2) DEFAULT 0,
    discount NUMERIC(5,2) DEFAULT 0,
    total NUMERIC(10,2) NOT NULL,
    payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'partial', 'cancelled')),
    payment_type TEXT CHECK (payment_type IN ('Cash', 'UPI', 'Card', 'Credit')),
    payment_reference TEXT,
    upload_method TEXT,
    gst_number TEXT,
    notes TEXT,
    created_by TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create purchase_items table
CREATE TABLE IF NOT EXISTS purchase_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID REFERENCES purchases(id),
    purchase_order_id UUID REFERENCES purchases(id),
    product_id UUID REFERENCES products(id),
    product_name TEXT NOT NULL,
    vendor_name TEXT NOT NULL,
    invoice_number TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_cost NUMERIC(10,2) NOT NULL,
    rate NUMERIC(10,2) NOT NULL,
    mrp NUMERIC(10,2) NOT NULL,
    purchase_date TIMESTAMP NOT NULL,
    total NUMERIC(10,2) NOT NULL,
    total_cost NUMERIC(10,2) NOT NULL,
    discount_percentage NUMERIC(5,2) DEFAULT 0,
    discount_amount NUMERIC(10,2) DEFAULT 0,
    tax_percentage NUMERIC(5,2) DEFAULT 0,
    tax_amount NUMERIC(10,2) DEFAULT 0,
    net_amount NUMERIC(10,2) NOT NULL,
    unit TEXT DEFAULT 'piece',
    pack_size TEXT,
    created_by TEXT,
    notes TEXT,
    sku TEXT,
    barcode TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create purchase_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS purchase_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID REFERENCES purchases(id),
    document_type TEXT,
    file_name TEXT,
    file_path TEXT,
    file_size INTEGER,
    uploaded_by TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
    product_id UUID REFERENCES products(id),
    product_name TEXT NOT NULL,
    current_stock INTEGER NOT NULL DEFAULT 0,
    opening_stock INTEGER NOT NULL DEFAULT 0,
    cost_price NUMERIC(10,2),
    selling_price NUMERIC(10,2),
    mrp NUMERIC(10,2),
    unit TEXT,
    pack_size TEXT,
    hsn_code TEXT,
    gst_percentage NUMERIC(5,2),
    vendor_name TEXT,
    invoice_number TEXT,
    invoice_date TIMESTAMP,
    batch_number TEXT,
    expiry_date DATE,
    min_stock INTEGER DEFAULT 0,
    max_stock INTEGER DEFAULT 0,
    reorder_level INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_by TEXT,
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT pk_inventory PRIMARY KEY (product_id)
);

-- Create inventory_transactions table
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'sale', 'adjustment', 'return', 'transfer')),
    quantity INTEGER NOT NULL,
    unit_cost NUMERIC(10,2),
    unit_price NUMERIC(10,2),
    transaction_date TIMESTAMP NOT NULL DEFAULT NOW(),
    reference_number TEXT,
    notes TEXT,
    created_by TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_product_name ON inventory(product_name);
CREATE INDEX IF NOT EXISTS idx_inventory_hsn_code ON inventory(hsn_code);
CREATE INDEX IF NOT EXISTS idx_inventory_vendor_name ON inventory(vendor_name);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product ON inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_date ON inventory_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON inventory_transactions(transaction_type);

-- Create trigger function for updating timestamp
CREATE OR REPLACE FUNCTION update_inventory_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_inventory_timestamp ON inventory;
CREATE TRIGGER update_inventory_timestamp
    BEFORE UPDATE ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_timestamp();

-- Create view for low stock alerts
CREATE OR REPLACE VIEW low_stock_alerts AS
SELECT 
    product_id,
    product_name,
    current_stock,
    min_stock,
    reorder_level
FROM inventory
WHERE current_stock <= reorder_level
AND is_active = true;
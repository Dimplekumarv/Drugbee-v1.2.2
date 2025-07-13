-- Create missing tables for purchase functionality
-- Copy and paste this into your Supabase SQL Editor

-- Create purchase_items table (this is the one causing the 404 error)
CREATE TABLE IF NOT EXISTS purchase_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID,
    purchase_order_id UUID,
    product_id UUID,
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

-- Create purchase_documents table
CREATE TABLE IF NOT EXISTS purchase_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID,
    document_type TEXT,
    file_name TEXT,
    file_path TEXT,
    file_size INTEGER,
    uploaded_by TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
    product_id UUID PRIMARY KEY,
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
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create inventory_transactions table
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID,
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
CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase_id ON purchase_items(purchase_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_product_id ON purchase_items(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product_name ON inventory(product_name);
CREATE INDEX IF NOT EXISTS idx_inventory_hsn_code ON inventory(hsn_code);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product ON inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_date ON inventory_transactions(transaction_date);

-- Create trigger function for updating inventory timestamp
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
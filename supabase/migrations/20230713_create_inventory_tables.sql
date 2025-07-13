-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    product_name TEXT NOT NULL,
    current_stock INTEGER DEFAULT 0,
    opening_stock INTEGER DEFAULT 0,
    cost_price DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    mrp DECIMAL(10,2),
    unit TEXT,
    pack_size TEXT,
    hsn_code TEXT,
    gst_percentage DECIMAL(5,2),
    vendor_name TEXT,
    invoice_number TEXT,
    invoice_date TIMESTAMP WITH TIME ZONE,
    batch_number TEXT,
    expiry_date TIMESTAMP WITH TIME ZONE,
    min_stock INTEGER DEFAULT 0,
    max_stock INTEGER DEFAULT 0,
    reorder_level INTEGER DEFAULT 0,
    batches JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory transactions table
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    transaction_type TEXT NOT NULL, -- 'purchase', 'sale', 'return', 'adjustment'
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2),
    unit_price DECIMAL(10,2),
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    reference_number TEXT,
    notes TEXT,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_inventory_product_id ON inventory(product_id);
CREATE INDEX idx_inventory_product_name ON inventory(product_name);
CREATE INDEX idx_inventory_hsn_code ON inventory(hsn_code);
CREATE INDEX idx_inventory_batch_number ON inventory(batch_number);
CREATE INDEX idx_inventory_vendor_name ON inventory(vendor_name);
CREATE INDEX idx_inventory_transactions_product_id ON inventory_transactions(product_id);
CREATE INDEX idx_inventory_transactions_type ON inventory_transactions(transaction_type);
CREATE INDEX idx_inventory_transactions_date ON inventory_transactions(transaction_date);

-- Enable Row Level Security
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for authenticated users" ON inventory
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON inventory
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON inventory
    FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Enable read access for authenticated users" ON inventory_transactions
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON inventory_transactions
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create view for stock summary
CREATE OR REPLACE VIEW stock_summary AS
SELECT 
    i.product_id,
    i.product_name,
    i.current_stock,
    i.mrp,
    i.selling_price,
    i.cost_price,
    i.hsn_code,
    i.gst_percentage,
    i.min_stock,
    i.max_stock,
    i.reorder_level,
    i.batches,
    CASE 
        WHEN i.current_stock <= i.min_stock THEN 'low'
        WHEN i.current_stock >= i.max_stock THEN 'high'
        ELSE 'normal'
    END as stock_status
FROM inventory i
WHERE i.is_active = true;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (be careful with this in production!)
DROP TABLE IF EXISTS purchase_items CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;

-- Create purchases table with UUID primary key
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id INTEGER REFERENCES vendors(id),
    vendor_name TEXT NOT NULL,
    invoice_number TEXT NOT NULL,
    invoice_date TIMESTAMP WITH TIME ZONE NOT NULL,
    payment_due_date TIMESTAMP WITH TIME ZONE,
    purchase_type TEXT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    payment_status TEXT NOT NULL,
    payment_type TEXT NOT NULL,
    payment_reference TEXT,
    upload_method TEXT,
    gst_number TEXT,
    notes TEXT,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create purchase_items table with UUID for both primary key and foreign key reference
CREATE TABLE purchase_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_id UUID REFERENCES purchases(id),
    purchase_order_id UUID REFERENCES purchases(id),
    product_id UUID REFERENCES products(id),
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    free_quantity INTEGER DEFAULT 0,
    rate DECIMAL(10,2) NOT NULL,
    mrp DECIMAL(10,2) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    scheme TEXT,
    scheme_percentage DECIMAL(5,2) DEFAULT 0,
    cgst DECIMAL(5,2) DEFAULT 0,
    sgst DECIMAL(5,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    batch TEXT,
    expiry_date TIMESTAMP WITH TIME ZONE,
    hsn_code TEXT,
    pack_units TEXT,
    margin_percentage DECIMAL(5,2),
    vendor_name TEXT,
    invoice_number TEXT,
    purchase_date TIMESTAMP WITH TIME ZONE,
    sku TEXT,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_purchase_items_purchase_id ON purchase_items(purchase_id);
CREATE INDEX idx_purchase_items_product_id ON purchase_items(product_id);
CREATE INDEX idx_purchases_vendor_id ON purchases(vendor_id);
CREATE INDEX idx_purchases_invoice_number ON purchases(invoice_number);
CREATE INDEX idx_purchases_created_at ON purchases(created_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;

-- Create policies for purchases table
CREATE POLICY "Enable read access for authenticated users" ON purchases
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON purchases
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON purchases
    FOR UPDATE
    TO authenticated
    USING (true);

-- Create policies for purchase_items table
CREATE POLICY "Enable read access for authenticated users" ON purchase_items
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON purchase_items
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON purchase_items
    FOR UPDATE
    TO authenticated
    USING (true);

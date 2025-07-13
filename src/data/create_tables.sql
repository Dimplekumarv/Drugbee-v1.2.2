-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
    product_id uuid PRIMARY KEY,
    product_name text,
    current_stock integer,
    opening_stock integer,
    cost_price numeric,
    selling_price numeric,
    mrp numeric,
    unit text,
    pack_size text,
    hsn_code text,
    gst_percentage numeric,
    vendor_name text,
    invoice_number text,
    invoice_date timestamp without time zone,
    batch_number text,
    expiry_date date,
    min_stock integer,
    max_stock integer,
    reorder_level integer,
    is_active boolean DEFAULT true,
    created_by text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by text,
    updated_at timestamp without time zone
);

-- Create purchase_items table
CREATE TABLE IF NOT EXISTS purchase_items (
    id bigserial PRIMARY KEY,
    purchase_id bigint,
    product_id uuid REFERENCES products(id),
    product_name text,
    quantity integer,
    free_quantity integer,
    rate numeric,
    mrp numeric,
    discount_percentage numeric,
    scheme text,
    scheme_percentage numeric,
    cgst numeric,
    sgst numeric,
    total numeric,
    batch text,
    expiry_date timestamp with time zone,
    hsn_code text,
    pack_units text,
    margin_percentage numeric,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone,
    vendor_name text,
    purchase_date timestamp with time zone,
    invoice_number text,
    barcode text,
    created_by text,
    discount_amount numeric,
    net_amount numeric,
    notes text,
    pack_size numeric,
    purchase_order_id bigint,
    sku text,
    tax_amount numeric,
    tax_percentage numeric,
    discount numeric,
    total_cost numeric,
    unit text,
    unit_cost numeric
);

-- Create inventory_transactions table
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id bigserial PRIMARY KEY,
    product_id uuid REFERENCES products(id),
    transaction_type text,
    quantity integer,
    unit_cost numeric,
    unit_price numeric,
    transaction_date timestamp with time zone,
    reference_number text,
    created_by text,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Create purchase_documents table
CREATE TABLE IF NOT EXISTS purchase_documents (
    id bigserial PRIMARY KEY,
    purchase_id bigint,
    document_type text,
    file_name text,
    file_path text,
    file_size bigint,
    uploaded_by text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Create RLS policies for inventory
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON inventory FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON inventory FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON inventory FOR UPDATE USING (auth.role() = 'authenticated');

-- Create RLS policies for purchase_items
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON purchase_items FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON purchase_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON purchase_items FOR UPDATE USING (auth.role() = 'authenticated');

-- Create RLS policies for inventory_transactions
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON inventory_transactions FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON inventory_transactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create RLS policies for purchase_documents
ALTER TABLE purchase_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON purchase_documents FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON purchase_documents FOR INSERT WITH CHECK (auth.role() = 'authenticated');

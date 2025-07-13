-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.inventory CASCADE;
DROP TABLE IF EXISTS public.purchase_items CASCADE;

-- Create inventory table with updated schema
CREATE TABLE public.inventory (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    product_id uuid NOT NULL,  -- Changed to UUID to match your products table
    product_name text NOT NULL,
    current_stock integer NOT NULL DEFAULT 0,
    opening_stock integer,
    cost_price numeric(10,2) NOT NULL DEFAULT 0,
    selling_price numeric(10,2),
    mrp numeric(10,2),
    unit text DEFAULT 'piece',
    pack_size text,
    hsn_code text,
    gst_percentage numeric(5,2),
    vendor_name text,
    invoice_number text,
    invoice_date timestamp with time zone,
    batch_number text,
    expiry_date date,
    min_stock integer,
    max_stock integer,
    reorder_level integer,
    is_active boolean DEFAULT true,
    created_by text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by text,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_id FOREIGN KEY (product_id) REFERENCES public.products(id)
);

-- Create purchase_items table with updated schema
CREATE TABLE public.purchase_items (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    purchase_id uuid NOT NULL,  -- Changed to UUID to match purchases table
    product_id uuid NOT NULL,   -- Changed to UUID to match products table
    product_name text NOT NULL,
    quantity integer NOT NULL DEFAULT 0,
    free_quantity integer DEFAULT 0,
    rate numeric(10,2) NOT NULL DEFAULT 0,
    mrp numeric(10,2) NOT NULL DEFAULT 0,
    discount_percentage numeric(5,2) DEFAULT 0,
    scheme text,
    scheme_percentage numeric(5,2) DEFAULT 0,
    cgst numeric(5,2) DEFAULT 0,
    sgst numeric(5,2) DEFAULT 0,
    total numeric(10,2) NOT NULL DEFAULT 0,
    batch text,
    expiry_date timestamp with time zone,
    hsn_code text,
    pack_units text,
    margin_percentage numeric(5,2) DEFAULT 0,
    vendor_name text,
    purchase_date timestamp with time zone NOT NULL,
    invoice_number text NOT NULL,
    barcode text,
    created_by text,
    discount_amount numeric(10,2) DEFAULT 0,
    net_amount numeric(10,2) DEFAULT 0,
    notes text,
    pack_size text,
    purchase_order_id uuid,
    sku text,
    tax_amount numeric(10,2) DEFAULT 0,
    tax_percentage numeric(5,2) DEFAULT 0,
    total_cost numeric(10,2) DEFAULT 0,
    unit text DEFAULT 'piece',
    unit_cost numeric(10,2) DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_id FOREIGN KEY (product_id) REFERENCES public.products(id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON public.inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_product_id ON public.purchase_items(product_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase_id ON public.purchase_items(purchase_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_invoice_number ON public.purchase_items(invoice_number);

-- Enable Row Level Security
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies
CREATE POLICY "Enable read access for all users" ON public.inventory FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.inventory FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON public.inventory FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON public.purchase_items FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.purchase_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON public.purchase_items FOR UPDATE USING (auth.role() = 'authenticated');

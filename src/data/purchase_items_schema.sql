-- Create purchase_items table
CREATE TABLE IF NOT EXISTS public.purchase_items (
    id BIGSERIAL PRIMARY KEY,
    purchase_id UUID NOT NULL,
    product_id UUID REFERENCES public.products(id),
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    free_quantity INTEGER DEFAULT 0,
    rate NUMERIC(10,2) NOT NULL DEFAULT 0,
    mrp NUMERIC(10,2) NOT NULL DEFAULT 0,
    discount_percentage NUMERIC(5,2) DEFAULT 0,
    scheme TEXT,
    scheme_percentage NUMERIC(5,2) DEFAULT 0,
    cgst NUMERIC(5,2) DEFAULT 0,
    sgst NUMERIC(5,2) DEFAULT 0,
    total NUMERIC(10,2) NOT NULL DEFAULT 0,
    batch TEXT,
    expiry_date TIMESTAMP WITH TIME ZONE,
    hsn_code TEXT,
    pack_units TEXT,
    margin_percentage NUMERIC(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    vendor_name TEXT,
    purchase_date TIMESTAMP WITH TIME ZONE NOT NULL,
    invoice_number TEXT NOT NULL,
    barcode TEXT,
    created_by TEXT,
    discount_amount NUMERIC(10,2) DEFAULT 0,
    net_amount NUMERIC(10,2) DEFAULT 0,
    notes TEXT,
    pack_size TEXT,
    purchase_order_id UUID,
    sku TEXT,
    tax_amount NUMERIC(10,2) DEFAULT 0,
    tax_percentage NUMERIC(5,2) DEFAULT 0,
    total_cost NUMERIC(10,2) DEFAULT 0,
    unit TEXT DEFAULT 'piece',
    unit_cost NUMERIC(10,2) DEFAULT 0,

    -- Add constraints
    CONSTRAINT quantity_non_negative CHECK (quantity >= 0),
    CONSTRAINT free_quantity_non_negative CHECK (free_quantity >= 0),
    CONSTRAINT rate_non_negative CHECK (rate >= 0),
    CONSTRAINT mrp_non_negative CHECK (mrp >= 0)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase_id ON public.purchase_items(purchase_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_product_id ON public.purchase_items(product_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_invoice_number ON public.purchase_items(invoice_number);
CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase_date ON public.purchase_items(purchase_date);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Allow read access to authenticated users"
    ON public.purchase_items
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow insert access to authenticated users
CREATE POLICY "Allow insert access to authenticated users"
    ON public.purchase_items
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow update access to authenticated users
CREATE POLICY "Allow update access to authenticated users"
    ON public.purchase_items
    FOR UPDATE
    TO authenticated
    USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_purchase_items_updated_at
    BEFORE UPDATE ON public.purchase_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

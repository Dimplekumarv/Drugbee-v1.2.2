-- =====================================================
-- FIXED SQL SCHEMA FOR INVENTORY MANAGEMENT
-- =====================================================

-- =====================================================
-- 1. CREATE INVENTORY TABLE
-- =====================================================
DROP TABLE IF EXISTS public.inventory CASCADE;
CREATE TABLE public.inventory (
    id SERIAL PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    current_stock INTEGER NOT NULL DEFAULT 0,
    opening_stock INTEGER NOT NULL DEFAULT 0,
    cost_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    selling_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    mrp DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    unit VARCHAR(50) DEFAULT 'piece',
    pack_size VARCHAR(100),
    hsn_code VARCHAR(20),
    gst_percentage DECIMAL(5,2) DEFAULT 0.00,
    vendor_name VARCHAR(255),
    invoice_number VARCHAR(100),
    invoice_date TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system',
    updated_by VARCHAR(100) DEFAULT 'system',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE INVENTORY_TRANSACTIONS TABLE
-- =====================================================
DROP TABLE IF EXISTS public.inventory_transactions CASCADE;
CREATE TABLE public.inventory_transactions (
    id SERIAL PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('purchase', 'sale', 'adjustment', 'return', 'transfer')),
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2) DEFAULT 0.00,
    unit_price DECIMAL(10,2) DEFAULT 0.00,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    reference_number VARCHAR(100),
    created_by VARCHAR(100) DEFAULT 'system',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. UPDATE PURCHASE_ITEMS TABLE (add missing columns)
-- =====================================================
-- Add missing columns to purchase_items if they don't exist
DO $$ 
BEGIN
    -- Add purchase_order_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchase_items' AND column_name = 'purchase_order_id') THEN
        ALTER TABLE public.purchase_items ADD COLUMN purchase_order_id INTEGER;
    END IF;
    
    -- Add margin_percentage if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchase_items' AND column_name = 'margin_percentage') THEN
        ALTER TABLE public.purchase_items ADD COLUMN margin_percentage DECIMAL(5,2) DEFAULT 0.00;
    END IF;
    
    -- Add vendor_name if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchase_items' AND column_name = 'vendor_name') THEN
        ALTER TABLE public.purchase_items ADD COLUMN vendor_name VARCHAR(255);
    END IF;
    
    -- Add invoice_number if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchase_items' AND column_name = 'invoice_number') THEN
        ALTER TABLE public.purchase_items ADD COLUMN invoice_number VARCHAR(100);
    END IF;
    
    -- Add purchase_date if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchase_items' AND column_name = 'purchase_date') THEN
        ALTER TABLE public.purchase_items ADD COLUMN purchase_date TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add sku if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchase_items' AND column_name = 'sku') THEN
        ALTER TABLE public.purchase_items ADD COLUMN sku VARCHAR(100);
    END IF;
    
    -- Add free_quantity if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchase_items' AND column_name = 'free_quantity') THEN
        ALTER TABLE public.purchase_items ADD COLUMN free_quantity INTEGER DEFAULT 0;
    END IF;
END $$;

-- =====================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =====================================================
-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON public.inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_hsn_code ON public.inventory(hsn_code);
CREATE INDEX IF NOT EXISTS idx_inventory_vendor_name ON public.inventory(vendor_name);
CREATE INDEX IF NOT EXISTS idx_inventory_invoice_number ON public.inventory(invoice_number);
CREATE INDEX IF NOT EXISTS idx_inventory_is_active ON public.inventory(is_active);

-- Inventory transactions indexes
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product_id ON public.inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON public.inventory_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_date ON public.inventory_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_reference ON public.inventory_transactions(reference_number);

-- Purchase items indexes
CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase_id ON public.purchase_items(purchase_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_product_id ON public.purchase_items(product_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_batch ON public.purchase_items(batch);
CREATE INDEX IF NOT EXISTS idx_purchase_items_expiry_date ON public.purchase_items(expiry_date);
CREATE INDEX IF NOT EXISTS idx_purchase_items_vendor_name ON public.purchase_items(vendor_name);
CREATE INDEX IF NOT EXISTS idx_purchase_items_invoice_number ON public.purchase_items(invoice_number);
CREATE INDEX IF NOT EXISTS idx_purchase_items_sku ON public.purchase_items(sku);

-- =====================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. CREATE RLS POLICIES
-- =====================================================
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable all operations for authenticated users on inventory" ON public.inventory;
DROP POLICY IF EXISTS "Enable all operations for authenticated users on inventory_transactions" ON public.inventory_transactions;
DROP POLICY IF EXISTS "Enable all operations for authenticated users on purchase_items" ON public.purchase_items;

-- Create new policies
CREATE POLICY "Enable all operations for authenticated users on inventory" 
ON public.inventory FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users on inventory_transactions" 
ON public.inventory_transactions FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users on purchase_items" 
ON public.purchase_items FOR ALL 
USING (auth.role() = 'authenticated');

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================
GRANT ALL ON public.inventory TO authenticated;
GRANT ALL ON public.inventory_transactions TO authenticated;
GRANT ALL ON public.purchase_items TO authenticated;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- 8. CREATE TRIGGERS FOR UPDATED_AT
-- =====================================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for inventory table
DROP TRIGGER IF EXISTS update_inventory_updated_at ON public.inventory;
CREATE TRIGGER update_inventory_updated_at
    BEFORE UPDATE ON public.inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. CREATE USEFUL VIEWS (FIXED)
-- =====================================================
-- Drop existing views if they exist
DROP VIEW IF EXISTS public.inventory_summary CASCADE;
DROP VIEW IF EXISTS public.purchase_items_with_inventory CASCADE;

-- Inventory summary view (FIXED)
CREATE VIEW public.inventory_summary AS
SELECT 
    inv.id,
    inv.product_id,
    COALESCE(p.name, inv.product_name) as product_name,
    p.generic_name,
    p.manufacturer,
    inv.current_stock,
    inv.cost_price,
    inv.selling_price,
    inv.mrp,
    inv.hsn_code,
    inv.gst_percentage,
    inv.vendor_name,
    inv.is_active,
    inv.updated_at,
    CASE 
        WHEN inv.current_stock <= 0 THEN 'Out of Stock'
        WHEN inv.current_stock <= 10 THEN 'Low Stock'
        ELSE 'In Stock'
    END as stock_status
FROM public.inventory inv
LEFT JOIN public.products p ON inv.product_id = p.id
WHERE inv.is_active = true;

-- Purchase items with inventory view (FIXED)
CREATE VIEW public.purchase_items_with_inventory AS
SELECT 
    pi.*,
    inv.current_stock,
    inv.cost_price as current_cost_price,
    COALESCE(p.name, pi.product_name) as full_product_name,
    p.generic_name,
    p.manufacturer
FROM public.purchase_items pi
LEFT JOIN public.inventory inv ON pi.product_id = inv.product_id
LEFT JOIN public.products p ON pi.product_id = p.id;

-- =====================================================
-- 10. VERIFICATION QUERIES
-- =====================================================
-- Check if tables were created successfully
SELECT 'inventory' as table_name, COUNT(*) as column_count 
FROM information_schema.columns 
WHERE table_name = 'inventory' AND table_schema = 'public'
UNION ALL
SELECT 'inventory_transactions' as table_name, COUNT(*) as column_count 
FROM information_schema.columns 
WHERE table_name = 'inventory_transactions' AND table_schema = 'public'
UNION ALL
SELECT 'purchase_items' as table_name, COUNT(*) as column_count 
FROM information_schema.columns 
WHERE table_name = 'purchase_items' AND table_schema = 'public';
-- First, create the products table if it doesn't exist (it's referenced by inventory)
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

-- Drop and recreate the inventory table
DROP TABLE IF EXISTS inventory CASCADE;
CREATE TABLE inventory (
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_inventory_product_name ON inventory(product_name);
CREATE INDEX IF NOT EXISTS idx_inventory_hsn_code ON inventory(hsn_code);
CREATE INDEX IF NOT EXISTS idx_inventory_vendor_name ON inventory(vendor_name);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product ON inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_date ON inventory_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON inventory_transactions(transaction_type);

-- Create the low stock alerts view
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

-- Create function to update stock
CREATE OR REPLACE FUNCTION update_inventory_stock(
    p_product_id UUID,
    p_quantity INTEGER,
    p_transaction_type TEXT
)
RETURNS VOID AS $$
BEGIN
    IF p_transaction_type IN ('purchase', 'return') THEN
        UPDATE inventory
        SET current_stock = current_stock + p_quantity
        WHERE product_id = p_product_id;
    ELSIF p_transaction_type IN ('sale', 'transfer') THEN
        UPDATE inventory
        SET current_stock = current_stock - p_quantity
        WHERE product_id = p_product_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create timestamp update trigger
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

-- Update inventory when a new purchase is made
CREATE OR REPLACE FUNCTION update_inventory_on_purchase()
RETURNS TRIGGER AS $$
DECLARE
    purchase_item RECORD;
BEGIN
    -- Update inventory for each purchase item
    FOR purchase_item IN SELECT * FROM purchase_items WHERE purchase_id = NEW.id LOOP
        -- Increase current stock
        UPDATE inventory
        SET current_stock = current_stock + purchase_item.quantity,
            updated_at = NOW(),
            updated_by = NEW.created_by
        WHERE product_id = purchase_item.product_id;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_inventory_on_purchase ON purchase_items;
CREATE TRIGGER update_inventory_on_purchase
AFTER INSERT ON purchase_items
FOR EACH ROW
EXECUTE FUNCTION update_inventory_on_purchase();

-- Update inventory when a purchase is updated
CREATE OR REPLACE FUNCTION update_inventory_on_purchase_update()
RETURNS TRIGGER AS $$
DECLARE
    old_purchase_item RECORD;
    new_purchase_item RECORD;
BEGIN
    -- Update inventory for each changed purchase item
    FOR old_purchase_item IN SELECT * FROM purchase_items WHERE purchase_id = OLD.id LOOP
        SELECT * INTO new_purchase_item
        FROM purchase_items
        WHERE purchase_id = NEW.id AND product_id = old_purchase_item.product_id;

        -- Increase/decrease current stock
        UPDATE inventory
        SET current_stock = current_stock + (new_purchase_item.quantity - old_purchase_item.quantity),
            updated_at = NOW(),
            updated_by = NEW.updated_by
        WHERE product_id = old_purchase_item.product_id;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_inventory_on_purchase_update ON purchase_items;
CREATE TRIGGER update_inventory_on_purchase_update
AFTER UPDATE ON purchase_items
FOR EACH ROW
EXECUTE FUNCTION update_inventory_on_purchase_update();

-- Update inventory when a purchase is deleted
CREATE OR REPLACE FUNCTION update_inventory_on_purchase_delete()
RETURNS TRIGGER AS $$
DECLARE
    purchase_item RECORD;
BEGIN
    -- Decrease current stock for each deleted purchase item
    FOR purchase_item IN SELECT * FROM purchase_items WHERE purchase_id = OLD.id LOOP
        UPDATE inventory
        SET current_stock = current_stock - purchase_item.quantity,
            updated_at = NOW(),
            updated_by = OLD.created_by
        WHERE product_id = purchase_item.product_id;
    END LOOP;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_inventory_on_purchase_delete ON purchase_items;
CREATE TRIGGER update_inventory_on_purchase_delete
AFTER DELETE ON purchase_items
FOR EACH ROW
EXECUTE FUNCTION update_inventory_on_purchase_delete();

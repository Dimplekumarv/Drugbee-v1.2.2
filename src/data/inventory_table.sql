-- Drop existing inventory table if it exists
DROP TABLE IF EXISTS inventory CASCADE;

-- Create Inventory Table
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

-- Create index for faster searches
CREATE INDEX idx_inventory_product_name ON inventory(product_name);
CREATE INDEX idx_inventory_hsn_code ON inventory(hsn_code);
CREATE INDEX idx_inventory_vendor_name ON inventory(vendor_name);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_inventory_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_inventory_timestamp
    BEFORE UPDATE ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_timestamp();

-- Create Inventory Transactions Table for tracking all inventory movements
CREATE TABLE inventory_transactions (
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

-- Create index for faster transaction lookups
CREATE INDEX idx_inventory_transactions_product ON inventory_transactions(product_id);
CREATE INDEX idx_inventory_transactions_date ON inventory_transactions(transaction_date);
CREATE INDEX idx_inventory_transactions_type ON inventory_transactions(transaction_type);

-- Create a view for low stock alerts
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

-- Create a function to update inventory stock
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

-- Add comments for documentation
COMMENT ON TABLE inventory IS 'Stores current inventory levels and product details';
COMMENT ON TABLE inventory_transactions IS 'Tracks all inventory movements';
COMMENT ON COLUMN inventory.current_stock IS 'Current available quantity of the product';
COMMENT ON COLUMN inventory.min_stock IS 'Minimum stock level before reorder';
COMMENT ON COLUMN inventory.reorder_level IS 'Stock level at which to reorder';

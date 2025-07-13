-- Products Table
CREATE TABLE products (
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
  price NUMERIC NOT NULL,
  gst_percentage NUMERIC,
  images TEXT[],
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add comment for GST column
COMMENT ON COLUMN products.gst_percentage IS 'Goods and Services Tax percentage (e.g., 5.0 for 5%)';

-- Online Store Products Table
CREATE TABLE store_products (
  product_id UUID REFERENCES products(id),
  is_featured BOOLEAN DEFAULT false,
  store_description TEXT,
  store_price NUMERIC,
  PRIMARY KEY (product_id)
);

-- Inventory Table
CREATE TABLE inventory (
  product_id UUID REFERENCES products(id),
  quantity INT NOT NULL CHECK (quantity >= 0),
  last_updated TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (product_id)
);

-- Purchases Table
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  supplier_name TEXT NOT NULL,
  purchase_date TIMESTAMP DEFAULT NOW(),
  quantity INT NOT NULL CHECK (quantity > 0),
  cost NUMERIC NOT NULL
);

-- Sales Table
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  customer_id UUID REFERENCES users(id),
  sale_date TIMESTAMP DEFAULT NOW(),
  quantity INT NOT NULL CHECK (quantity > 0),
  revenue NUMERIC NOT NULL
);

-- Online Orders Table
CREATE TABLE online_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id),
  order_date TIMESTAMP DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_price NUMERIC NOT NULL,
  shipping_address TEXT
);

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer', 'pharmacist')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Profiles Table
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  full_name TEXT,
  address TEXT,
  phone TEXT,
  date_of_birth DATE,
  last_order TIMESTAMP
);

-- Function to automatically update inventory on purchase
CREATE OR REPLACE FUNCTION update_inventory_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
  -- Update inventory when a purchase is made
  INSERT INTO inventory (product_id, quantity, last_updated)
  VALUES (NEW.product_id, NEW.quantity, NOW())
  ON CONFLICT (product_id) 
  DO UPDATE SET 
    quantity = inventory.quantity + EXCLUDED.quantity,
    last_updated = EXCLUDED.last_updated;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to execute inventory update on new purchase
CREATE TRIGGER purchase_inventory_update
AFTER INSERT ON purchases
FOR EACH ROW
EXECUTE FUNCTION update_inventory_on_purchase();

-- Indexes for performance
-- Vendors Table
CREATE TABLE vendors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  country TEXT,
  zip TEXT,
  gst_number TEXT,
  drug_license TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an update trigger for vendors updated_at
CREATE OR REPLACE FUNCTION update_vendor_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vendor_updated_at
  BEFORE UPDATE ON vendors
  FOR EACH ROW
  EXECUTE FUNCTION update_vendor_updated_at();

-- Update purchases table to use vendor_id instead of supplier_name
ALTER TABLE purchases DROP COLUMN supplier_name;
ALTER TABLE purchases ADD COLUMN vendor_id INTEGER NOT NULL REFERENCES vendors(id);
ALTER TABLE purchases ADD COLUMN invoice_number TEXT NOT NULL;
ALTER TABLE purchases ADD COLUMN invoice_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE purchases ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'completed'));
ALTER TABLE purchases ADD COLUMN payment_method TEXT;
ALTER TABLE purchases ADD COLUMN remarks TEXT;

-- Indexes for improved performance
CREATE INDEX idx_purchases_product ON purchases(product_id);
CREATE INDEX idx_purchases_vendor ON purchases(vendor_id);
CREATE INDEX idx_sales_product ON sales(product_id);
CREATE INDEX idx_online_orders_user ON online_orders(user_id);

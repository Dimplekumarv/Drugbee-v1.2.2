-- =====================================================
-- FIX RLS POLICIES FOR PURCHASE MANAGEMENT
-- =====================================================

-- =====================================================
-- 1. DROP EXISTING POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Enable all operations for authenticated users on inventory" ON public.inventory;
DROP POLICY IF EXISTS "Enable all operations for authenticated users on inventory_transactions" ON public.inventory_transactions;
DROP POLICY IF EXISTS "Enable all operations for authenticated users on purchase_items" ON public.purchase_items;

-- =====================================================
-- 2. CREATE MORE PERMISSIVE POLICIES
-- =====================================================

-- Policy for inventory table
CREATE POLICY "Allow all operations on inventory" 
ON public.inventory FOR ALL 
USING (true)
WITH CHECK (true);

-- Policy for inventory_transactions table
CREATE POLICY "Allow all operations on inventory_transactions" 
ON public.inventory_transactions FOR ALL 
USING (true)
WITH CHECK (true);

-- Policy for purchase_items table
CREATE POLICY "Allow all operations on purchase_items" 
ON public.purchase_items FOR ALL 
USING (true)
WITH CHECK (true);

-- =====================================================
-- 3. ALTERNATIVE: DISABLE RLS TEMPORARILY (if needed)
-- =====================================================
-- Uncomment these lines if you want to disable RLS completely for testing
-- ALTER TABLE public.inventory DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.inventory_transactions DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.purchase_items DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. GRANT ADDITIONAL PERMISSIONS
-- =====================================================
GRANT ALL ON public.inventory TO authenticated;
GRANT ALL ON public.inventory_transactions TO authenticated;
GRANT ALL ON public.purchase_items TO authenticated;

-- Grant to anon role as well (for unauthenticated access if needed)
GRANT ALL ON public.inventory TO anon;
GRANT ALL ON public.inventory_transactions TO anon;
GRANT ALL ON public.purchase_items TO anon;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- =====================================================
-- 5. VERIFICATION
-- =====================================================
-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('inventory', 'inventory_transactions', 'purchase_items');

-- Check table permissions
SELECT table_name, privilege_type, grantee 
FROM information_schema.table_privileges 
WHERE table_name IN ('inventory', 'inventory_transactions', 'purchase_items')
AND table_schema = 'public';
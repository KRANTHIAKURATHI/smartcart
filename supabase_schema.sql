-- ============================================================
-- SmartCart — Complete Supabase SQL Schema
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- 1. Users
CREATE TABLE IF NOT EXISTS public.users (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL UNIQUE,
  role       TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'STAFF', 'ADMIN')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Products
CREATE TABLE IF NOT EXISTS public.products (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  category    TEXT NOT NULL,
  stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Carts
CREATE TABLE IF NOT EXISTS public.carts (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 4. Cart Items
CREATE TABLE IF NOT EXISTS public.cart_items (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id    UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity   INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cart_id, product_id)
);

-- 5. Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  total_amount   NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  status         TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','CONFIRMED','SHIPPED','DELIVERED','CANCELLED')),
  payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING','PAID','FAILED','REFUNDED')),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id   UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE SET NULL,
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  price      NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Discounts
CREATE TABLE IF NOT EXISTS public.discounts (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE UNIQUE,
  percentage NUMERIC(5,2) NOT NULL CHECK (percentage > 0 AND percentage <= 90),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Inventory Logs
CREATE TABLE IF NOT EXISTS public.inventory_logs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  change     INTEGER NOT NULL,
  note       TEXT,
  timestamp  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id     ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id  ON public.cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_carts_user_id          ON public.carts(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id         ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status          ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id   ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_products_category      ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_product ON public.inventory_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_discounts_product_id   ON public.discounts(product_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTION: Get current user's role
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================================
-- RLS POLICIES: users
-- ============================================================

CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (id = auth.uid() OR get_user_role() IN ('ADMIN', 'STAFF'));

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Allow insert on signup"
  ON public.users FOR INSERT
  WITH CHECK (id = auth.uid());

-- ============================================================
-- RLS POLICIES: products
-- ============================================================

CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role() = 'ADMIN');

CREATE POLICY "Only admins can update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (get_user_role() = 'ADMIN');

CREATE POLICY "Only admins can delete products"
  ON public.products FOR DELETE
  TO authenticated
  USING (get_user_role() = 'ADMIN');

-- ============================================================
-- RLS POLICIES: carts
-- ============================================================

CREATE POLICY "Users can access own cart"
  ON public.carts FOR SELECT
  USING (user_id = auth.uid() OR get_user_role() IN ('ADMIN', 'STAFF'));

CREATE POLICY "Users can create own cart"
  ON public.carts FOR INSERT
  WITH CHECK (user_id = auth.uid() OR get_user_role() IN ('ADMIN', 'STAFF'));

CREATE POLICY "Users can update own cart"
  ON public.carts FOR UPDATE
  USING (user_id = auth.uid() OR get_user_role() IN ('ADMIN', 'STAFF'));

-- ============================================================
-- RLS POLICIES: cart_items
-- ============================================================

CREATE POLICY "Users can view own cart items"
  ON public.cart_items FOR SELECT
  USING (
    cart_id IN (
      SELECT id FROM public.carts
      WHERE user_id = auth.uid()
    ) OR get_user_role() IN ('ADMIN', 'STAFF')
  );

CREATE POLICY "Users can insert own cart items"
  ON public.cart_items FOR INSERT
  WITH CHECK (
    cart_id IN (
      SELECT id FROM public.carts
      WHERE user_id = auth.uid()
    ) OR get_user_role() IN ('ADMIN', 'STAFF')
  );

CREATE POLICY "Users can update own cart items"
  ON public.cart_items FOR UPDATE
  USING (
    cart_id IN (
      SELECT id FROM public.carts
      WHERE user_id = auth.uid()
    ) OR get_user_role() IN ('ADMIN', 'STAFF')
  );

CREATE POLICY "Users can delete own cart items"
  ON public.cart_items FOR DELETE
  USING (
    cart_id IN (
      SELECT id FROM public.carts
      WHERE user_id = auth.uid()
    ) OR get_user_role() IN ('ADMIN', 'STAFF')
  );

-- ============================================================
-- RLS POLICIES: orders
-- ============================================================

CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (user_id = auth.uid() OR get_user_role() IN ('ADMIN', 'STAFF'));

CREATE POLICY "Users can create own orders"
  ON public.orders FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  USING (get_user_role() IN ('ADMIN', 'STAFF'));

-- ============================================================
-- RLS POLICIES: order_items
-- ============================================================

CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM public.orders
      WHERE user_id = auth.uid()
    ) OR get_user_role() IN ('ADMIN', 'STAFF')
  );

CREATE POLICY "Users can insert own order items"
  ON public.order_items FOR INSERT
  WITH CHECK (
    order_id IN (
      SELECT id FROM public.orders
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- RLS POLICIES: discounts
-- ============================================================

CREATE POLICY "Anyone can view discounts"
  ON public.discounts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage discounts"
  ON public.discounts FOR ALL
  TO authenticated
  USING (get_user_role() = 'ADMIN')
  WITH CHECK (get_user_role() = 'ADMIN');

-- ============================================================
-- RLS POLICIES: inventory_logs
-- ============================================================

CREATE POLICY "Admins and staff can view inventory logs"
  ON public.inventory_logs FOR SELECT
  USING (get_user_role() IN ('ADMIN', 'STAFF'));

CREATE POLICY "System can insert inventory logs"
  ON public.inventory_logs FOR INSERT
  WITH CHECK (get_user_role() IN ('ADMIN', 'STAFF') OR auth.uid() IS NOT NULL);

-- ============================================================
-- REALTIME SUBSCRIPTIONS
-- ============================================================

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.cart_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.carts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;

-- ============================================================
-- SEED DATA — Sample Products
-- ============================================================

INSERT INTO public.products (name, description, price, category, stock, image_url) VALUES
  ('Wireless Noise-Cancelling Headphones', 'Premium over-ear headphones with 40hr battery life', 8999.00, 'Electronics', 25, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'),
  ('Mechanical Gaming Keyboard', 'RGB backlit, blue switches, TKL layout', 5499.00, 'Electronics', 15, 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400'),
  ('Ultra HD Webcam 4K', 'Auto-focus, wide-angle lens, plug and play', 3299.00, 'Electronics', 30, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400'),
  ('Smart Fitness Watch', 'Heart rate, SpO2, GPS, 7-day battery', 12499.00, 'Electronics', 10, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'),
  ('Premium Cotton T-Shirt', 'Soft, breathable, available in 12 colors', 899.00, 'Clothing', 100, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'),
  ('Running Shoes Pro', 'Lightweight, responsive foam, breathable mesh', 4299.00, 'Clothing', 40, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'),
  ('Organic Green Tea (100g)', 'First flush Darjeeling, hand-picked leaves', 499.00, 'Food', 200, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400'),
  ('Cold Brew Coffee Kit', 'Makes 1L of smooth, low-acid cold brew', 1299.00, 'Food', 60, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400'),
  ('The Pragmatic Programmer', '20th anniversary edition, by David Thomas & Andrew Hunt', 2199.00, 'Books', 35, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'),
  ('Ergonomic Desk Stand', 'Adjustable laptop stand, aluminium, foldable', 2499.00, 'Home', 45, 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400'),
  ('Yoga Mat Premium', '6mm thick, non-slip, eco-friendly TPE', 1799.00, 'Sports', 55, 'https://images.unsplash.com/photo-1601925228228-8d1b1e9bb12b?w=400'),
  ('Vitamin C Serum', '20% concentration, hyaluronic acid, 30ml', 1099.00, 'Beauty', 80, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400')
ON CONFLICT DO NOTHING;

-- Add sample discounts
INSERT INTO public.discounts (product_id, percentage)
SELECT id, 15 FROM public.products WHERE name = 'Wireless Noise-Cancelling Headphones'
ON CONFLICT DO NOTHING;

INSERT INTO public.discounts (product_id, percentage)
SELECT id, 20 FROM public.products WHERE name = 'Premium Cotton T-Shirt'
ON CONFLICT DO NOTHING;

INSERT INTO public.discounts (product_id, percentage)
SELECT id, 10 FROM public.products WHERE name = 'Running Shoes Pro'
ON CONFLICT DO NOTHING;

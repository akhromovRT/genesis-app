-- Genesis MVP v1: Initial schema
-- Tables, indexes, RLS policies, triggers, sequences

-- ============================================================
-- 1. SEQUENCES
-- ============================================================

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- ============================================================
-- 2. HELPER FUNCTIONS
-- ============================================================

-- Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Generate order number: GEN-000001
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
  SELECT 'GEN-' || lpad(nextval('order_number_seq')::text, 6, '0');
$$ LANGUAGE sql;

-- Auto-update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 3. TABLES
-- ============================================================

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tests (genetic tests catalog)
CREATE TABLE public.tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  code TEXT DEFAULT '',
  price INT NOT NULL,
  description TEXT DEFAULT '',
  full_description TEXT DEFAULT '',
  markers_count INT,
  turnaround_days INT,
  biomaterial TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  image_url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE DEFAULT public.generate_order_number(),
  user_id UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'processing', 'ready', 'completed', 'cancelled', 'refunded')),
  total_amount INT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  payment_id TEXT,
  payment_status TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Order items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES public.tests(id),
  test_name TEXT NOT NULL,
  price INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Order status history (audit trail)
CREATE TABLE public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  changed_by UUID REFERENCES public.profiles(id),
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Test results (PDF files uploaded by admin)
CREATE TABLE public.test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id),
  order_item_id UUID REFERENCES public.order_items(id),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INT,
  description TEXT DEFAULT '',
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Cart items (server-side cart for authenticated users)
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES public.tests(id),
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, test_id)
);

-- ============================================================
-- 4. INDEXES
-- ============================================================

CREATE INDEX idx_tests_category_id ON public.tests(category_id);
CREATE INDEX idx_tests_slug ON public.tests(slug);
CREATE INDEX idx_tests_is_active ON public.tests(is_active);
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_test_results_user_id ON public.test_results(user_id);
CREATE INDEX idx_test_results_order_id ON public.test_results(order_id);
CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);

-- ============================================================
-- 5. TRIGGERS
-- ============================================================

-- Auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_tests_updated_at BEFORE UPDATE ON public.tests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Categories (public read, admin write)
CREATE POLICY "Anyone can view active categories"
  ON public.categories FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update categories"
  ON public.categories FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete categories"
  ON public.categories FOR DELETE
  USING (public.is_admin());

-- Tests (public read active, admin full access)
CREATE POLICY "Anyone can view active tests"
  ON public.tests FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can insert tests"
  ON public.tests FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update tests"
  ON public.tests FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete tests"
  ON public.tests FOR DELETE
  USING (public.is_admin());

-- Orders
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Authenticated users can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  USING (public.is_admin());

-- Order items
CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Authenticated users can create order items"
  ON public.order_items FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Order status history
CREATE POLICY "Users can view own order history"
  ON public.order_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_status_history.order_id
      AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Admins can insert status history"
  ON public.order_status_history FOR INSERT
  WITH CHECK (public.is_admin());

-- Test results
CREATE POLICY "Users can view own results"
  ON public.test_results FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins can insert results"
  ON public.test_results FOR INSERT
  WITH CHECK (public.is_admin());

-- Cart items
CREATE POLICY "Users can view own cart"
  ON public.cart_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own cart"
  ON public.cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart"
  ON public.cart_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from own cart"
  ON public.cart_items FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 7. STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('test-results', 'test-results', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('catalog-images', 'catalog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: test-results
CREATE POLICY "Users can view own test results files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'test-results' AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.is_admin()
  ));

CREATE POLICY "Admins can upload test results"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'test-results' AND public.is_admin());

-- Storage policies: catalog-images (public read, admin write)
CREATE POLICY "Anyone can view catalog images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'catalog-images');

CREATE POLICY "Admins can upload catalog images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'catalog-images' AND public.is_admin());

CREATE POLICY "Admins can update catalog images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'catalog-images' AND public.is_admin());

CREATE POLICY "Admins can delete catalog images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'catalog-images' AND public.is_admin());

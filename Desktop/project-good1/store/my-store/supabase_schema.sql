-- ============================================================
-- S-Mahalat Marketplace — Complete Supabase Schema
-- ============================================================
-- Run this entire script in: Supabase Dashboard → SQL Editor → New Query
-- It is safe to run multiple times (uses IF NOT EXISTS / OR REPLACE).
-- ============================================================

-- ─── 1. Enable UUID extension ────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 2. Tables ───────────────────────────────────────────────

-- 👤 STORES
CREATE TABLE IF NOT EXISTS public.stores (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 📂 CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE
);

-- 📦 PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id    uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  name        text NOT NULL,
  description text NOT NULL DEFAULT '',
  price       numeric NOT NULL DEFAULT 0,
  image       text NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── 3. Indexes for performance ──────────────────────────────

CREATE INDEX IF NOT EXISTS idx_stores_user_id     ON public.stores(user_id);
CREATE INDEX IF NOT EXISTS idx_products_store_id  ON public.products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category  ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug    ON public.categories(slug);

-- ─── 4. Enable Row Level Security ───────────────────────────

ALTER TABLE public.stores     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products   ENABLE ROW LEVEL SECURITY;

-- ─── 5. RLS Policies ────────────────────────────────────────

-- ── STORES policies ──

-- Anyone can read all stores (public marketplace)
CREATE POLICY "Stores are publicly readable"
  ON public.stores FOR SELECT
  USING (true);

-- Authenticated users can create their own stores
CREATE POLICY "Users can create their own stores"
  ON public.stores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update only their own stores
CREATE POLICY "Users can update their own stores"
  ON public.stores FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete only their own stores
CREATE POLICY "Users can delete their own stores"
  ON public.stores FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ── CATEGORIES policies ──

-- Anyone can read categories
CREATE POLICY "Categories are publicly readable"
  ON public.categories FOR SELECT
  USING (true);

-- ── PRODUCTS policies ──

-- Anyone can read all products (public marketplace)
CREATE POLICY "Products are publicly readable"
  ON public.products FOR SELECT
  USING (true);

-- Users can create products only in their own stores
CREATE POLICY "Users can create products in their stores"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = store_id
        AND stores.user_id = auth.uid()
    )
  );

-- Users can update products only in their own stores
CREATE POLICY "Users can update products in their stores"
  ON public.products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = store_id
        AND stores.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = store_id
        AND stores.user_id = auth.uid()
    )
  );

-- Users can delete products only in their own stores
CREATE POLICY "Users can delete products in their stores"
  ON public.products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = store_id
        AND stores.user_id = auth.uid()
    )
  );

-- ─── 6. Seed categories ─────────────────────────────────────

INSERT INTO public.categories (name, slug) VALUES
  ('Electronics',         'electronics'),
  ('Clothing',            'clothing'),
  ('Home & Garden',       'home-garden'),
  ('Sports & Outdoors',   'sports-outdoors'),
  ('Books & Media',       'books-media'),
  ('Food & Beverages',    'food-beverages')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- ✅ DONE! Your database is ready for S-Mahalat.
-- ============================================================

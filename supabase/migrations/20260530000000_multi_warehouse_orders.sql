-- Enable pgcrypto for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. Create Core Tables
-- ==========================================

-- Warehouses in the GCC (e.g. Riyadh, Dubai)
CREATE TABLE IF NOT EXISTS public.warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    city TEXT NOT NULL,
    country_code TEXT NOT NULL CHECK (country_code IN ('SA', 'AE')),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inventory per product per warehouse
CREATE TABLE IF NOT EXISTS public.inventory (
    warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (warehouse_id, product_id),
    CONSTRAINT quantity_non_negative CHECK (quantity >= 0)
);

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL,
    shipping_city TEXT NOT NULL,
    shipping_lat DECIMAL(10, 8) NOT NULL,
    shipping_lng DECIMAL(11, 8) NOT NULL,
    items JSONB NOT NULL, -- Format: [{"product_id": "uuid", "quantity": integer}]
    warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL, -- Populated by trigger
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing for optimized lookups under heavy concurrency
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON public.inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_warehouses_status ON public.warehouses(status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- ==========================================
-- 2. Create Utility Distance Function (Haversine)
-- ==========================================
CREATE OR REPLACE FUNCTION public.calculate_haversine_distance(
    lat1 NUMERIC,
    lng1 NUMERIC,
    lat2 NUMERIC,
    lng2 NUMERIC
) RETURNS NUMERIC AS $$
DECLARE
    r NUMERIC := 6371; -- Earth radius in km
    dlat NUMERIC := radians(lat2 - lat1);
    dlng NUMERIC := radians(lng2 - lng1);
    a NUMERIC;
    c NUMERIC;
BEGIN
    a := sin(dlat/2)^2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng/2)^2;
    c := 2 * asin(sqrt(a));
    RETURN r * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE STRICT;

-- ==========================================
-- 3. Core Multi-Warehouse Order Trigger
-- ==========================================
CREATE OR REPLACE FUNCTION public.optimize_order_warehouse_and_stock()
RETURNS TRIGGER AS $$
DECLARE
    item_record RECORD;
    optimal_warehouse_id UUID;
    min_distance NUMERIC;
    stock_globally_unavailable BOOLEAN;
    p_id UUID;
    qty INT;
BEGIN
    -- 1. Validate structure of items JSONB
    IF NEW.items IS NULL OR jsonb_array_length(NEW.items) = 0 THEN
        RAISE EXCEPTION 'ERR_ORDER_INVALID: Order must contain at least one item'
            USING ERRCODE = '45001';
    END IF;

    -- 2. Obtain ROW LOCKS in a STRICT, SORTED order to prevent database deadlocks.
    -- All concurrent transactions will lock product inventory in identical sequential order (product_id ASC, warehouse_id ASC).
    PERFORM 1
    FROM public.inventory
    WHERE product_id IN (
        SELECT DISTINCT (val->>'product_id')::uuid
        FROM jsonb_array_elements(NEW.items) AS val
    )
    ORDER BY product_id, warehouse_id
    FOR UPDATE;

    -- 3. Search for the nearest warehouse that has ALL items in stock
    SELECT w.id, public.calculate_haversine_distance(NEW.shipping_lat, NEW.shipping_lng, w.latitude, w.longitude) AS distance
    FROM public.warehouses w
    WHERE w.status = 'active'
      AND NOT EXISTS (
          -- Subquery returns true if there is any item for which this warehouse has insufficient inventory
          SELECT 1
          FROM jsonb_array_elements(NEW.items) AS item
          LEFT JOIN public.inventory i ON i.warehouse_id = w.id AND i.product_id = (item->>'product_id')::uuid
          WHERE i.quantity IS NULL OR i.quantity < (item->>'quantity')::int
      )
    ORDER BY distance ASC
    LIMIT 1
    INTO optimal_warehouse_id, min_distance;

    -- 4. Handle optimal warehouse path
    IF optimal_warehouse_id IS NOT NULL THEN
        -- Deduct stock from the optimal warehouse
        FOR item_record IN 
            SELECT (val->>'product_id')::uuid AS p_id, (val->>'quantity')::int AS qty 
            FROM jsonb_array_elements(NEW.items) AS val
        LOOP
            UPDATE public.inventory
            SET quantity = quantity - item_record.qty
            WHERE warehouse_id = optimal_warehouse_id AND product_id = item_record.p_id;
        END LOOP;

        -- Auto-assign warehouse to the order
        NEW.warehouse_id := optimal_warehouse_id;
        RETURN NEW;
    END IF;

    -- 5. Edge-Case Resolution: No single warehouse has full stock
    -- Step A: Check if the stock is completely unavailable globally (sum of stock across all warehouses < requested)
    SELECT EXISTS (
        SELECT 1
        FROM (
            SELECT (item->>'product_id')::uuid AS p_id, SUM(COALESCE(i.quantity, 0)) as total_qty, (item->>'quantity')::int as req_qty
            FROM jsonb_array_elements(NEW.items) AS item
            LEFT JOIN public.inventory i ON i.product_id = (item->>'product_id')::uuid
            GROUP BY p_id, req_qty
        ) total_stock
        WHERE total_stock.total_qty < total_stock.req_qty
    ) INTO stock_globally_unavailable;

    IF stock_globally_unavailable THEN
        RAISE EXCEPTION 'ERR_STOCK_UNAVAILABLE: One or more products are sold out or have insufficient total inventory'
            USING ERRCODE = '45002';
    END IF;

    -- Step B: If stock is available globally but split across multiple warehouses
    RAISE EXCEPTION 'ERR_STOCK_SPLIT_REQUIRED: Total stock is available, but split across multiple warehouses. Partial fulfillment required.'
        USING ERRCODE = '45003';

END;
$$ LANGUAGE plpgsql;

-- Create the trigger before order insert
DROP TRIGGER IF EXISTS trg_optimize_order_warehouse_and_stock ON public.orders;
CREATE TRIGGER trg_optimize_order_warehouse_and_stock
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.optimize_order_warehouse_and_stock();

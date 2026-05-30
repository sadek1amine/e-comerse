-- Create profiles role enum type
CREATE TYPE public.user_role AS ENUM ('customer', 'admin', 'influencer');

-- Create public profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    email TEXT UNIQUE NOT NULL,
    role public.user_role NOT NULL DEFAULT 'customer',
    phone TEXT,
    preferred_language TEXT NOT NULL DEFAULT 'ar' CHECK (preferred_language IN ('ar', 'en')),
    shipping_address JSONB, -- For default: { "city": "Riyadh", "lat": 24.7136, "lng": 46.6753, "street": "..." }
    billing_address JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index profiles for fast email and role filtering
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS Policies for Profiles
-- ==========================================

-- Allow individuals to select their own profile
CREATE POLICY "Allow users to view their own profiles"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Allow individuals to update their own profile
CREATE POLICY "Allow users to update their own profiles"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow admins full control over all profiles
CREATE POLICY "Allow admins full control on profiles"
ON public.profiles FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- ==========================================
-- Trigger: Auto-sync auth.users to public.profiles
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user_sync()
RETURNS TRIGGER AS $$
DECLARE
    meta_first_name TEXT;
    meta_last_name TEXT;
    meta_role public.user_role := 'customer';
BEGIN
    -- Extract first and last names from raw metadata if present (common in OAuth providers)
    meta_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'full_name', '');
    meta_last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');

    -- If a specific role is declared in user creation meta (e.g. from custom admin panel creators)
    IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
        BEGIN
            meta_role := (NEW.raw_user_meta_data->>'role')::public.user_role;
        EXCEPTION WHEN OTHERS THEN
            meta_role := 'customer';
        END;
    END IF;

    -- Insert profile representation
    INSERT INTO public.profiles (
        id,
        first_name,
        last_name,
        email,
        role,
        phone,
        preferred_language
    ) VALUES (
        NEW.id,
        NULLIF(meta_first_name, ''),
        NULLIF(meta_last_name, ''),
        NEW.email,
        meta_role,
        NEW.phone,
        COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'ar')
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users insertion
DROP TRIGGER IF EXISTS trg_handle_new_user_sync ON auth.users;
CREATE TRIGGER trg_handle_new_user_sync
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_sync();

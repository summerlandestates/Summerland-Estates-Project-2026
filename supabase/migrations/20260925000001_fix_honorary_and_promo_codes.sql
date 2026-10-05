-- Fix missing columns and tables reported by the app

-- 1. Add honorary membership columns to profiles (used by membership.ts and dev-server.js)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS honorary_until timestamptz,
  ADD COLUMN IF NOT EXISTS honorary_tier text;

COMMENT ON COLUMN public.profiles.honorary_until IS 'Timestamp until which the profile has complimentary honorary Pro access';
COMMENT ON COLUMN public.profiles.honorary_tier IS 'The Pro tier granted via honorary membership (e.g., professional-pro)';

-- 2. Create promo_codes table (used by AdminPromoCodesPage and membershipApplication.ts)
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text,
  discount_type text NOT NULL DEFAULT 'free_pro_6months',
  tier text,
  max_uses integer NOT NULL DEFAULT 1,
  used_count integer NOT NULL DEFAULT 0,
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.promo_codes IS 'Promotional codes that grant discounted or free Pro tiers';

-- 3. Create user_promo_codes join table (used by membershipApplication.ts)
CREATE TABLE IF NOT EXISTS public.user_promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  promo_code_id uuid NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  redeemed_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  UNIQUE(user_id, promo_code_id)
);

COMMENT ON TABLE public.user_promo_codes IS 'Records of promo codes redeemed by users';

-- 4. Ensure commonly referenced profile columns exist
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status text,
  ADD COLUMN IF NOT EXISTS tier text,
  ADD COLUMN IF NOT EXISTS profile_type text,
  ADD COLUMN IF NOT EXISTS subscription_status text,
  ADD COLUMN IF NOT EXISTS subscription_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_status text,
  ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS application_data jsonb,
  ADD COLUMN IF NOT EXISTS rejection_reason text;

-- 5. Enable RLS on new tables and add sensible policies for authenticated users
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_promo_codes ENABLE ROW LEVEL SECURITY;

-- Helper to determine whether the current user is an admin based on profiles.role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Admins can manage promo codes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'promo_codes' AND policyname = 'admins_manage_promo_codes'
  ) THEN
    CREATE POLICY "admins_manage_promo_codes" ON public.promo_codes
      FOR ALL TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END
$$;

-- Authenticated users can read active promo codes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'promo_codes' AND policyname = 'users_read_active_promo_codes'
  ) THEN
    CREATE POLICY "users_read_active_promo_codes" ON public.promo_codes
      FOR SELECT TO authenticated
      USING (is_active = true);
  END IF;
END
$$;

-- Users can read their own promo redemptions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_promo_codes' AND policyname = 'users_read_own_redemptions'
  ) THEN
    CREATE POLICY "users_read_own_redemptions" ON public.user_promo_codes
      FOR SELECT TO authenticated
      USING (user_id = auth.uid());
  END IF;
END
$$;

-- Users can record their own redemptions; admins can record redemptions for any user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_promo_codes' AND policyname = 'users_insert_own_redemptions'
  ) THEN
    CREATE POLICY "users_insert_own_redemptions" ON public.user_promo_codes
      FOR INSERT TO authenticated
      WITH CHECK (user_id = auth.uid() OR public.is_admin());
  END IF;
END
$$;

-- 5. Ensure notification + phone columns used by the notification settings page
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS notification_preferences jsonb;

-- Adds honorary membership fields to profiles for complimentary Pro access
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS honorary_until timestamptz,
  ADD COLUMN IF NOT EXISTS honorary_tier text;

COMMENT ON COLUMN public.profiles.honorary_until IS 'Timestamp until which the profile has complimentary honorary Pro access';
COMMENT ON COLUMN public.profiles.honorary_tier IS 'The Pro tier granted via honorary membership (e.g., professional-pro)';

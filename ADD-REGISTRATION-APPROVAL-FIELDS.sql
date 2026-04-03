-- Registration approval workflow support
-- Run this in Supabase SQL Editor

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS application_data JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.profiles(id);

UPDATE public.profiles
SET status = 'approved'
WHERE status IS NULL AND role = 'admin';

UPDATE public.profiles
SET status = 'pending'
WHERE status IS NULL AND role IS DISTINCT FROM 'admin';

CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- Fix schema gaps reported at runtime
-- Run this in the Supabase SQL Editor

-- 1. event_registrations.user_id
ALTER TABLE public.event_registrations
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id
  ON public.event_registrations(user_id);

-- 2. sponsorships.user_id
ALTER TABLE public.sponsorships
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_sponsorships_user_id
  ON public.sponsorships(user_id);

-- 3. recognitions.submitter_id & submitter_email
ALTER TABLE public.recognitions
  ADD COLUMN IF NOT EXISTS submitter_id UUID REFERENCES auth.users(id);

ALTER TABLE public.recognitions
  ADD COLUMN IF NOT EXISTS submitter_email TEXT;

CREATE INDEX IF NOT EXISTS idx_recognitions_submitter_id
  ON public.recognitions(submitter_id);

CREATE INDEX IF NOT EXISTS idx_recognitions_submitter_email
  ON public.recognitions(submitter_email);

-- 4. public.profile_views table
CREATE TABLE IF NOT EXISTS public.profile_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewer_id TEXT DEFAULT 'anonymous',
  viewer_name TEXT DEFAULT 'Anonymous',
  viewer_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_views_profile_id
  ON public.profile_views(profile_id);

CREATE INDEX IF NOT EXISTS idx_profile_views_viewer_id
  ON public.profile_views(viewer_id);

CREATE INDEX IF NOT EXISTS idx_profile_views_created_at
  ON public.profile_views(created_at DESC);

ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- Drop and recreate profile_views policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can view all profile views" ON public.profile_views;
DROP POLICY IF EXISTS "Profile owners can view their own views" ON public.profile_views;

CREATE POLICY "Admins can view all profile views"
  ON public.profile_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Profile owners can view their own views"
  ON public.profile_views FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

-- 5. Ensure child tables for listings exist with all columns, FKs, and indexes
--    (fixes "column X does not exist" and postgREST relationship cache errors)

CREATE TABLE IF NOT EXISTS public.skills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID,
  skill_name TEXT,
  skill_type TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.work_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID,
  job_title TEXT,
  city TEXT,
  duties TEXT[],
  start_date TEXT,
  end_date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.certifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID,
  certification_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID,
  reviewer_name TEXT,
  reviewer_role TEXT,
  rating INTEGER,
  comment TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID,
  service_name TEXT,
  description TEXT,
  price TEXT,
  duration TEXT
);

-- Add any missing columns to existing child tables
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS listing_id UUID;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS skill_name TEXT;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS skill_type TEXT DEFAULT 'general';
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE public.work_history ADD COLUMN IF NOT EXISTS listing_id UUID;
ALTER TABLE public.work_history ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE public.work_history ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.work_history ADD COLUMN IF NOT EXISTS duties TEXT[];
ALTER TABLE public.work_history ADD COLUMN IF NOT EXISTS start_date TEXT;
ALTER TABLE public.work_history ADD COLUMN IF NOT EXISTS end_date TEXT;
ALTER TABLE public.work_history ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE public.certifications ADD COLUMN IF NOT EXISTS listing_id UUID;
ALTER TABLE public.certifications ADD COLUMN IF NOT EXISTS certification_name TEXT;
ALTER TABLE public.certifications ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS listing_id UUID;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS reviewer_name TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS reviewer_role TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS rating INTEGER;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS comment TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE public.services ADD COLUMN IF NOT EXISTS listing_id UUID;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS service_name TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS price TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS duration TEXT;

-- Add FKs if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'skills_listing_id_fkey'
      AND table_schema = 'public' AND table_name = 'skills'
  ) THEN
    ALTER TABLE public.skills ADD CONSTRAINT skills_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'work_history_listing_id_fkey'
      AND table_schema = 'public' AND table_name = 'work_history'
  ) THEN
    ALTER TABLE public.work_history ADD CONSTRAINT work_history_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'certifications_listing_id_fkey'
      AND table_schema = 'public' AND table_name = 'certifications'
  ) THEN
    ALTER TABLE public.certifications ADD CONSTRAINT certifications_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'reviews_listing_id_fkey'
      AND table_schema = 'public' AND table_name = 'reviews'
  ) THEN
    ALTER TABLE public.reviews ADD CONSTRAINT reviews_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'services_listing_id_fkey'
      AND table_schema = 'public' AND table_name = 'services'
  ) THEN
    ALTER TABLE public.services ADD CONSTRAINT services_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Indexes for postgREST relationship detection and query performance
CREATE INDEX IF NOT EXISTS idx_skills_listing_id ON public.skills(listing_id);
CREATE INDEX IF NOT EXISTS idx_work_history_listing_id ON public.work_history(listing_id);
CREATE INDEX IF NOT EXISTS idx_certifications_listing_id ON public.certifications(listing_id);
CREATE INDEX IF NOT EXISTS idx_reviews_listing_id ON public.reviews(listing_id);
CREATE INDEX IF NOT EXISTS idx_services_listing_id ON public.services(listing_id);

-- Refresh the postgREST schema cache so the new relationships are recognized
NOTIFY pgrst, 'reload schema';

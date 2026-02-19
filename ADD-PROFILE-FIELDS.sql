-- Run this in Supabase SQL Editor to add new profile fields
-- Run each section separately if you encounter errors

-- =============================================
-- SECTION 1: Add profile columns
-- =============================================
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 0;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS available_date DATE;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(2,1) DEFAULT 0;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- =============================================
-- SECTION 2: Drop existing reviews table if it exists (to recreate cleanly)
-- WARNING: This will delete all existing reviews data!
-- Comment out this line if you want to keep existing data
-- =============================================
DROP TABLE IF EXISTS public.reviews CASCADE;

-- =============================================
-- SECTION 3: Create reviews table
-- =============================================
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(reviewer_id, profile_id)
);

-- =============================================
-- SECTION 4: Enable RLS and create policies
-- =============================================
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can read reviews" ON public.reviews;

-- Create policies
CREATE POLICY "Users can create reviews"
ON public.reviews FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Anyone can read reviews"
ON public.reviews FOR SELECT
TO public
USING (true);

-- =============================================
-- SECTION 5: Create function and trigger for rating updates
-- =============================================
CREATE OR REPLACE FUNCTION update_profile_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET 
    average_rating = (
      SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0)
      FROM public.reviews
      WHERE profile_id = NEW.profile_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE profile_id = NEW.profile_id
    )
  WHERE id = NEW.profile_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_review_created ON public.reviews;

-- Create trigger
CREATE TRIGGER on_review_created
AFTER INSERT ON public.reviews
FOR EACH ROW EXECUTE FUNCTION update_profile_rating();

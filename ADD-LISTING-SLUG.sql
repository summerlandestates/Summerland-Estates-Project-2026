-- Add slug column and index to existing listings table
-- Run this in Supabase SQL Editor

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_listings_slug
  ON public.listings(slug);

-- Optional: backfill slugs for existing listings
-- This generates URL-friendly slugs from name and id to avoid collisions
UPDATE public.listings
SET slug = LOWER(REGEXP_REPLACE(
  COALESCE(name, 'listing') || '-' || id::text,
  '[^a-z0-9-]+', '-', 'g'
))
WHERE slug IS NULL OR slug = '';

-- Auto-generate slug for new listings if not provided
CREATE OR REPLACE FUNCTION public.generate_listing_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(REGEXP_REPLACE(
      COALESCE(NEW.name, 'listing') || '-' || NEW.id::text,
      '[^a-z0-9-]+', '-', 'g'
    ));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_listing_slug ON public.listings;
CREATE TRIGGER set_listing_slug
  BEFORE INSERT ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_listing_slug();

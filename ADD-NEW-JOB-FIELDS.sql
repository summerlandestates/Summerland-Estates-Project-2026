-- Run this in Supabase SQL Editor to add new job posting fields
-- These columns support the updated job posting form

-- Add holidays_required column to job_postings table
ALTER TABLE public.job_postings 
ADD COLUMN IF NOT EXISTS holidays_required BOOLEAN DEFAULT false;

-- Add personality_fit column to job_postings table
ALTER TABLE public.job_postings 
ADD COLUMN IF NOT EXISTS personality_fit TEXT;

-- Make job_category optional (was required before)
ALTER TABLE public.job_postings 
ALTER COLUMN job_category DROP NOT NULL;

-- Update the employment_types comment to include 'remote' option
COMMENT ON COLUMN public.job_postings.employment_types IS 'Options: full_time, part_time, live_in, contract, temporary, remote';

-- Update the schedule requirements comment to include holidays
COMMENT ON COLUMN public.job_postings.on_call_required IS 'On-call availability required';
COMMENT ON COLUMN public.job_postings.holidays_required IS 'Holidays work required';
COMMENT ON COLUMN public.job_postings.personality_fit IS 'Description of ideal personality traits and cultural fit';

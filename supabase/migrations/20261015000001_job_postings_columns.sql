-- The job posting form collects holidays_required and personality_fit, and
-- JobDetailPage renders them, but the columns were never added to job_postings.
-- Run in Supabase SQL Editor if the columns are missing.

alter table public.job_postings
  add column if not exists holidays_required boolean default false,
  add column if not exists personality_fit text;

notify pgrst, 'reload schema';

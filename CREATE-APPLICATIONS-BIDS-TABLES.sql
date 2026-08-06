-- Run this in Supabase SQL Editor
-- NOTE: The job_applications and service_bids tables were already created by
-- ADD-JOBS-TABLES.sql with columns: job_applications(job_posting_id, applicant_id,
-- cover_letter, resume_url, status) and service_bids(service_request_id, bidder_id,
-- quote_amount, message, estimated_completion_date, status). RLS policies for
-- SELECT/INSERT/UPDATE were also already created there.
--
-- This script only ADDS the contact-info columns (name/email/phone) needed so
-- applicants/bidders who aren't logged in with a full profile can still submit
-- their contact details through the form.

-- =============================================
-- JOB APPLICATIONS: add contact columns
-- =============================================
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS applicant_name VARCHAR(255);
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS applicant_email VARCHAR(255);
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS applicant_phone VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_job_applications_created_at ON public.job_applications(created_at);

-- =============================================
-- SERVICE BIDS: add contact columns
-- =============================================
ALTER TABLE public.service_bids ADD COLUMN IF NOT EXISTS bidder_name VARCHAR(255);
ALTER TABLE public.service_bids ADD COLUMN IF NOT EXISTS bidder_email VARCHAR(255);
ALTER TABLE public.service_bids ADD COLUMN IF NOT EXISTS bidder_phone VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_service_bids_created_at ON public.service_bids(created_at);

-- Run this in Supabase SQL Editor to create job postings and service requests tables

-- =============================================
-- JOB POSTINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.job_postings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Job Details
  job_title VARCHAR(255) NOT NULL,
  job_category VARCHAR(100) NOT NULL,
  job_description TEXT NOT NULL,
  
  -- Location & Compensation
  location VARCHAR(255) NOT NULL,
  salary_range VARCHAR(100) NOT NULL,
  
  -- Employment Type (stored as JSON array)
  employment_types JSONB DEFAULT '[]'::jsonb,
  -- Options: full_time, part_time, live_in, contract, temporary
  
  -- Schedule Requirements
  days_required JSONB DEFAULT '[]'::jsonb,
  -- Options: monday, tuesday, wednesday, thursday, friday, saturday, sunday, flexible
  hours_per_week INTEGER,
  hours_per_day INTEGER,
  start_time TIME,
  end_time TIME,
  schedule_notes TEXT,
  weekend_work_required BOOLEAN DEFAULT false,
  evening_work_required BOOLEAN DEFAULT false,
  overnight_stays_required BOOLEAN DEFAULT false,
  on_call_required BOOLEAN DEFAULT false,
  
  -- Requirements
  experience_required VARCHAR(50),
  qualifications TEXT,
  drivers_license_required BOOLEAN DEFAULT false,
  background_check_required BOOLEAN DEFAULT false,
  references_required BOOLEAN DEFAULT false,
  drug_test_required BOOLEAN DEFAULT false,
  
  -- Benefits (stored as JSON array)
  benefits JSONB DEFAULT '[]'::jsonb,
  -- Options: health_insurance, retirement, paid_time_off, housing_provided, meals_provided, car_provided, professional_development, bonus
  
  -- Contact Information
  contact_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50),
  application_instructions TEXT,
  application_deadline DATE,
  
  -- Preferences
  preferred_start_date DATE,
  travel_required BOOLEAN DEFAULT false,
  relocation_assistance BOOLEAN DEFAULT false,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active',
  -- Options: active, closed, draft, expired
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SERVICE REQUESTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.service_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Service Details
  service_needed VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  date_needed DATE NOT NULL,
  details TEXT NOT NULL,
  special_requests TEXT,
  
  -- Budget (optional)
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  
  -- Status
  status VARCHAR(50) DEFAULT 'open',
  -- Options: open, in_progress, completed, cancelled
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SERVICE BIDS TABLE (for service providers to bid on requests)
-- =============================================
CREATE TABLE IF NOT EXISTS public.service_bids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  quote_amount DECIMAL(10,2) NOT NULL,
  message TEXT,
  estimated_completion_date DATE,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending',
  -- Options: pending, accepted, rejected, withdrawn
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_bid UNIQUE(service_request_id, bidder_id)
);

-- =============================================
-- JOB APPLICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_posting_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  cover_letter TEXT,
  resume_url VARCHAR(500),
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending',
  -- Options: pending, reviewed, shortlisted, rejected, hired
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_application UNIQUE(job_posting_id, applicant_id)
);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES FOR JOB POSTINGS
-- =============================================

-- Anyone can view active job postings
CREATE POLICY "Anyone can view active job postings"
ON public.job_postings FOR SELECT
TO public
USING (status = 'active');

-- Users can create their own job postings
CREATE POLICY "Users can create job postings"
ON public.job_postings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own job postings
CREATE POLICY "Users can update own job postings"
ON public.job_postings FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their own job postings
CREATE POLICY "Users can delete own job postings"
ON public.job_postings FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES FOR SERVICE REQUESTS
-- =============================================

-- Anyone can view open service requests
CREATE POLICY "Anyone can view open service requests"
ON public.service_requests FOR SELECT
TO public
USING (status = 'open');

-- Users can create their own service requests
CREATE POLICY "Users can create service requests"
ON public.service_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own service requests
CREATE POLICY "Users can update own service requests"
ON public.service_requests FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their own service requests
CREATE POLICY "Users can delete own service requests"
ON public.service_requests FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES FOR SERVICE BIDS
-- =============================================

-- Request owners can view all bids on their requests
CREATE POLICY "Request owners can view bids"
ON public.service_bids FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.service_requests sr
    WHERE sr.id = service_request_id AND sr.user_id = auth.uid()
  )
  OR bidder_id = auth.uid()
);

-- Users can create bids
CREATE POLICY "Users can create bids"
ON public.service_bids FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = bidder_id);

-- Users can update their own bids
CREATE POLICY "Users can update own bids"
ON public.service_bids FOR UPDATE
TO authenticated
USING (auth.uid() = bidder_id);

-- Request owners can update bid status (accept/reject)
CREATE POLICY "Request owners can update bid status"
ON public.service_bids FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.service_requests sr
    WHERE sr.id = service_request_id AND sr.user_id = auth.uid()
  )
);

-- =============================================
-- RLS POLICIES FOR JOB APPLICATIONS
-- =============================================

-- Job posters can view applications for their jobs
CREATE POLICY "Job posters can view applications"
ON public.job_applications FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.job_postings jp
    WHERE jp.id = job_posting_id AND jp.user_id = auth.uid()
  )
  OR applicant_id = auth.uid()
);

-- Users can create applications
CREATE POLICY "Users can create applications"
ON public.job_applications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = applicant_id);

-- Users can update their own applications
CREATE POLICY "Users can update own applications"
ON public.job_applications FOR UPDATE
TO authenticated
USING (auth.uid() = applicant_id);

-- Job posters can update application status
CREATE POLICY "Job posters can update application status"
ON public.job_applications FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.job_postings jp
    WHERE jp.id = job_posting_id AND jp.user_id = auth.uid()
  )
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_job_postings_user_id ON public.job_postings(user_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON public.job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_category ON public.job_postings(job_category);
CREATE INDEX IF NOT EXISTS idx_job_postings_location ON public.job_postings(location);

CREATE INDEX IF NOT EXISTS idx_service_requests_user_id ON public.service_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON public.service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_date ON public.service_requests(date_needed);

CREATE INDEX IF NOT EXISTS idx_service_bids_request_id ON public.service_bids(service_request_id);
CREATE INDEX IF NOT EXISTS idx_service_bids_bidder_id ON public.service_bids(bidder_id);

CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON public.job_applications(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_applicant_id ON public.job_applications(applicant_id);

-- =============================================
-- TRIGGER TO UPDATE updated_at TIMESTAMP
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_job_postings_updated_at
BEFORE UPDATE ON public.job_postings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at
BEFORE UPDATE ON public.service_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_bids_updated_at
BEFORE UPDATE ON public.service_bids
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
BEFORE UPDATE ON public.job_applications
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

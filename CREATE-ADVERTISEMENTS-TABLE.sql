-- Advertisements Table
CREATE TABLE IF NOT EXISTS advertisements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  ad_type TEXT NOT NULL CHECK (ad_type IN ('homepage_banner', 'sidebar', 'native_listing', 'newsletter', 'email_blast', 'custom')),
  ad_content TEXT,
  image_url TEXT,
  target_url TEXT,
  placement_location TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'paused', 'expired', 'rejected')),
  start_date DATE,
  end_date DATE,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  amount_paid DECIMAL(10, 2),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Email Blast Submissions Table (for user-submitted email campaigns)
CREATE TABLE IF NOT EXISTS email_blast_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  target_audience TEXT DEFAULT 'all',
  status TEXT DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'pending_review', 'approved', 'sent', 'rejected')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  stripe_payment_intent_id TEXT,
  amount_paid DECIMAL(10, 2) DEFAULT 12.99,
  scheduled_send_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  recipients_count INTEGER,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_blast_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public to create ad inquiries" ON advertisements;
DROP POLICY IF EXISTS "Allow admin to view all ads" ON advertisements;
DROP POLICY IF EXISTS "Allow admin to update ads" ON advertisements;
DROP POLICY IF EXISTS "Users can view their own email blasts" ON email_blast_submissions;
DROP POLICY IF EXISTS "Users can create email blasts" ON email_blast_submissions;
DROP POLICY IF EXISTS "Allow admin to view all email blasts" ON email_blast_submissions;
DROP POLICY IF EXISTS "Allow admin to update email blasts" ON email_blast_submissions;

-- Policies for advertisements
CREATE POLICY "Allow public to create ad inquiries"
  ON advertisements
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow admin to view all ads"
  ON advertisements
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'admin@summerlandestates.com');

CREATE POLICY "Allow admin to update ads"
  ON advertisements
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'admin@summerlandestates.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'admin@summerlandestates.com');

-- Policies for email blast submissions
CREATE POLICY "Users can view their own email blasts"
  ON email_blast_submissions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create email blasts"
  ON email_blast_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending email blasts"
  ON email_blast_submissions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status IN ('pending_payment', 'pending_review'));

CREATE POLICY "Allow admin to view all email blasts"
  ON email_blast_submissions
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'admin@summerlandestates.com');

CREATE POLICY "Allow admin to update email blasts"
  ON email_blast_submissions
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'admin@summerlandestates.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'admin@summerlandestates.com');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_advertisements_status ON advertisements(status);
CREATE INDEX IF NOT EXISTS idx_advertisements_type ON advertisements(ad_type);
CREATE INDEX IF NOT EXISTS idx_advertisements_dates ON advertisements(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_email_blasts_user_id ON email_blast_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_email_blasts_status ON email_blast_submissions(status);

-- Function to increment ad clicks
CREATE OR REPLACE FUNCTION increment_ad_clicks(ad_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE advertisements
  SET clicks = clicks + 1
  WHERE id = ad_id;
END;
$$;

-- Function to increment ad impressions
CREATE OR REPLACE FUNCTION increment_ad_impressions(ad_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE advertisements
  SET impressions = impressions + 1
  WHERE id = ad_id;
END;
$$;

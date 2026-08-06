-- Sponsorships Table
CREATE TABLE IF NOT EXISTS sponsorships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  sponsorship_type TEXT NOT NULL CHECK (sponsorship_type IN ('event', 'newsletter', 'website', 'premium_content', 'custom')),
  budget_range TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected', 'completed')),
  admin_notes TEXT,
  start_date DATE,
  end_date DATE,
  amount DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sponsorships_user_id ON sponsorships(user_id);

-- Enable RLS
ALTER TABLE sponsorships ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public to create sponsorship inquiries" ON sponsorships;
DROP POLICY IF EXISTS "Allow admin to view all sponsorships" ON sponsorships;
DROP POLICY IF EXISTS "Allow admin to update sponsorships" ON sponsorships;

-- Policies
CREATE POLICY "Allow public to create sponsorship inquiries"
  ON sponsorships
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow admin to view all sponsorships"
  ON sponsorships
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'admin@summerlandestates.com');

CREATE POLICY "Allow admin to update sponsorships"
  ON sponsorships
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'admin@summerlandestates.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'admin@summerlandestates.com');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sponsorships_status ON sponsorships(status);
CREATE INDEX IF NOT EXISTS idx_sponsorships_type ON sponsorships(sponsorship_type);
CREATE INDEX IF NOT EXISTS idx_sponsorships_created_at ON sponsorships(created_at DESC);

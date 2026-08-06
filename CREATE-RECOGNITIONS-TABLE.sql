-- Create recognitions table for Estate Services Recognition page
CREATE TABLE IF NOT EXISTS recognitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitter_id UUID REFERENCES auth.users(id),
  submitter_email TEXT,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  category VARCHAR(50) NOT NULL CHECK (category IN ('employee', 'craft', 'annual', 'story', 'vendor')),
  description TEXT NOT NULL,
  award_date DATE NOT NULL,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for category queries
CREATE INDEX IF NOT EXISTS idx_recognitions_category ON recognitions(category);
CREATE INDEX IF NOT EXISTS idx_recognitions_status ON recognitions(status);
CREATE INDEX IF NOT EXISTS idx_recognitions_display_order ON recognitions(display_order);

-- Enable RLS
ALTER TABLE recognitions ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to avoid conflicts
DROP POLICY IF EXISTS "Public can view published recognitions" ON recognitions;
DROP POLICY IF EXISTS "Admin can manage recognitions" ON recognitions;
DROP POLICY IF EXISTS "Users can view own recognitions" ON recognitions;
DROP POLICY IF EXISTS "Users can delete own recognitions" ON recognitions;

-- Allow public to view published recognitions
CREATE POLICY "Public can view published recognitions"
  ON recognitions FOR SELECT
  USING (status = 'published');

-- Allow admin to manage all recognitions
CREATE POLICY "Admin can manage recognitions"
  ON recognitions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Users can view their own recognition submissions
CREATE POLICY "Users can view own recognitions"
  ON recognitions FOR SELECT
  TO authenticated
  USING (submitter_id = auth.uid());

-- Users can delete their own recognitions (if pending)
CREATE POLICY "Users can delete own recognitions"
  ON recognitions FOR DELETE
  TO authenticated
  USING (submitter_id = auth.uid() AND status = 'draft');

-- Insert sample data
INSERT INTO recognitions (name, title, location, category, description, award_date, is_featured, display_order, status) VALUES
('Maria Santos', 'Executive Housekeeper', 'Beverly Hills, CA', 'employee', 'Exceptional attention to detail and dedication to maintaining the highest standards of cleanliness and organization.', '2026-03-01', true, 1, 'published'),
('James Chen', 'Estate Manager', 'Miami, FL', 'employee', 'Outstanding leadership in coordinating multiple properties and managing a team of 15 staff members.', '2026-02-01', true, 2, 'published'),
('Sophie Laurent', 'Private Chef', 'New York, NY', 'employee', 'Creative culinary excellence and ability to accommodate diverse dietary requirements with grace.', '2026-01-01', true, 3, 'published'),
('Robert Williams', 'Master Craftsman', 'Los Angeles, CA', 'craft', 'Recognized for exceptional skill in custom woodworking and furniture restoration for luxury estates.', '2026-03-01', false, 4, 'published'),
('Elena Rodriguez', 'Head Gardener', 'Santa Barbara, CA', 'craft', 'Award-winning landscape design and sustainable garden management for high-end properties.', '2026-02-01', false, 5, 'published'),
('Michael Chang', 'Security Specialist', 'San Francisco, CA', 'craft', 'Excellence in estate security planning and implementation of advanced surveillance systems.', '2026-01-01', false, 6, 'published');

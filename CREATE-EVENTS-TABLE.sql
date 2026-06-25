-- Create events table for event submissions and management
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('networking', 'workshop', 'conference', 'webinar', 'social', 'training')),
  date DATE NOT NULL,
  time VARCHAR(100),
  location VARCHAR(255),
  is_online BOOLEAN DEFAULT false,
  meeting_link TEXT,
  image_url TEXT,
  capacity INTEGER,
  registration_url TEXT,
  organizer_name VARCHAR(255),
  organizer_email VARCHAR(255),
  is_featured BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'published', 'cancelled', 'completed')),
  admin_notes TEXT,
  submitted_by UUID REFERENCES auth.users(id),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_submitted_by ON events(submitted_by);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow public to view approved/published events
CREATE POLICY "Public can view published events"
  ON events FOR SELECT
  USING (status IN ('approved', 'published', 'completed'));

-- Allow authenticated users to submit events (insert only)
CREATE POLICY "Authenticated users can submit events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to view their own submissions
CREATE POLICY "Users can view their own event submissions"
  ON events FOR SELECT
  TO authenticated
  USING (submitted_by = auth.uid());

-- Allow admin to manage all events
CREATE POLICY "Admin can manage all events"
  ON events FOR ALL
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

-- Insert sample upcoming events
INSERT INTO events (title, description, event_type, date, time, location, is_online, capacity, organizer_name, organizer_email, is_featured, status) VALUES
('Summerland Estates Annual Gala', 'Join us for an evening of networking and celebration with estate professionals from across the country.', 'social', '2026-12-15', '6:00 PM - 10:00 PM', 'Beverly Hills Hotel, CA', false, 200, 'Summerland Estates Team', 'events@summerlandestates.com', true, 'published'),
('Estate Management Best Practices Workshop', 'Learn from industry leaders about the latest trends in luxury estate management.', 'workshop', '2026-11-20', '10:00 AM - 4:00 PM', 'Virtual Event', true, 500, 'Sarah Johnson', 'workshops@summerlandestates.com', false, 'published'),
('Household Staff Training Conference', 'Comprehensive training for all household staff positions with certification opportunities.', 'conference', '2026-10-05', '9:00 AM - 5:00 PM', 'Miami Beach Convention Center', false, 300, 'Training Department', 'training@summerlandestates.com', true, 'published');

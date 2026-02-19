-- Create content_pages table for admin content management
CREATE TABLE IF NOT EXISTS content_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE content_pages ENABLE ROW LEVEL SECURITY;

-- Allow public read access to content pages
CREATE POLICY "Public can view content pages"
  ON content_pages
  FOR SELECT
  USING (true);

-- Only admins can insert content pages
CREATE POLICY "Admins can insert content pages"
  ON content_pages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can update content pages
CREATE POLICY "Admins can update content pages"
  ON content_pages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can delete content pages
CREATE POLICY "Admins can delete content pages"
  ON content_pages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on content_pages
CREATE TRIGGER update_content_pages_updated_at
  BEFORE UPDATE ON content_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create helper function for creating table (used in AdminContentPage)
CREATE OR REPLACE FUNCTION create_content_pages_table()
RETURNS void AS $$
BEGIN
  -- Table already exists, do nothing
  RETURN;
END;
$$ LANGUAGE plpgsql;

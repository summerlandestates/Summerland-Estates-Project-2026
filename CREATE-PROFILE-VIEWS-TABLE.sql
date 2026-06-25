-- Create profile_views table for analytics and email notifications
CREATE TABLE IF NOT EXISTS profile_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    viewer_id TEXT NOT NULL DEFAULT 'anonymous',
    viewer_name TEXT,
    viewer_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profile_views_profile_id ON profile_views(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewer_id ON profile_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_created_at ON profile_views(created_at);

-- Enable RLS
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile's analytics
CREATE POLICY "Users can view own profile analytics" 
ON profile_views FOR SELECT 
USING (profile_id IN (
    SELECT id FROM profiles WHERE id = auth.uid()
));

-- Policy: Admins can view all analytics
CREATE POLICY "Admins can view all analytics" 
ON profile_views FOR ALL 
USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
));

-- Policy: Allow inserts from authenticated users and anon
CREATE POLICY "Allow profile view inserts" 
ON profile_views FOR INSERT 
WITH CHECK (true);

COMMENT ON TABLE profile_views IS 'Tracks profile views for analytics and email notifications';

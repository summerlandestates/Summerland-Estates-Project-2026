-- Add user_id column to sponsorships table
ALTER TABLE sponsorships ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create index for user_id queries
CREATE INDEX IF NOT EXISTS idx_sponsorships_user_id ON sponsorships(user_id);

-- Update RLS policies to use user_id
DROP POLICY IF EXISTS "Allow admin to view all sponsorships" ON sponsorships;
DROP POLICY IF EXISTS "Allow admin to update sponsorships" ON sponsorships;
DROP POLICY IF EXISTS "Users can view own sponsorships" ON sponsorships;
DROP POLICY IF EXISTS "Users can delete own sponsorships" ON sponsorships;

-- Users can view their own sponsorships
CREATE POLICY "Users can view own sponsorships"
  ON sponsorships FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can delete their own sponsorships
CREATE POLICY "Users can delete own sponsorships"
  ON sponsorships FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Admin can view all sponsorships
CREATE POLICY "Admin can view all sponsorships"
  ON sponsorships FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin can update all sponsorships
CREATE POLICY "Admin can update all sponsorships"
  ON sponsorships FOR UPDATE
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

-- Add submitter columns to recognitions table
ALTER TABLE recognitions ADD COLUMN IF NOT EXISTS submitter_id UUID REFERENCES auth.users(id);
ALTER TABLE recognitions ADD COLUMN IF NOT EXISTS submitter_email TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_recognitions_submitter_id ON recognitions(submitter_id);
CREATE INDEX IF NOT EXISTS idx_recognitions_submitter_email ON recognitions(submitter_email);

-- Drop old policies
DROP POLICY IF EXISTS "Users can view own recognitions" ON recognitions;
DROP POLICY IF EXISTS "Users can delete own recognitions" ON recognitions;

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

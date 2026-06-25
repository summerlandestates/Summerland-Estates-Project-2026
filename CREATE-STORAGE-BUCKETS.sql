-- Storage bucket policies for article-images
-- This bucket already exists and has folders: contact, feature-image
-- We add folders: recognitions, events
-- Run this in Supabase SQL Editor

-- Storage Policies for article-images bucket
-- First drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can view article images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can manage article images" ON storage.objects;

-- Allow public to read
CREATE POLICY "Public can view article images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'article-images');

-- Allow admin to manage
CREATE POLICY "Admin can manage article images"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'article-images' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    bucket_id = 'article-images' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

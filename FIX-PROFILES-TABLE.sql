-- Fix profiles table constraint error
-- Run this in Supabase SQL Editor

-- Drop the problematic constraint if it exists
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Make role column nullable and remove constraint
ALTER TABLE profiles ALTER COLUMN role DROP NOT NULL;

-- Update the role check to allow NULL
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IS NULL OR role IN ('professional', 'business', 'agency', 'estates', 'admin'));

-- Make sure all required columns exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tier TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_code TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_code_expires_at TIMESTAMP WITH TIME ZONE;

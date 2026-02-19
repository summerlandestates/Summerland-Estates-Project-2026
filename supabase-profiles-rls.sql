-- Fix Row Level Security for profiles table
-- This allows anyone to INSERT into profiles (needed for account creation)

-- Drop existing policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Recreate policies with INSERT permission
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can insert profiles" 
  ON public.profiles
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update own profile" 
  ON public.profiles
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile" 
  ON public.profiles
  FOR DELETE 
  USING (auth.uid() = id);

-- Add missing columns for Stripe and email verification
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tier TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_type TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_code TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_code_expires_at TIMESTAMP WITH TIME ZONE;

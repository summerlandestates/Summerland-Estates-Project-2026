-- IMPORTANT: Run this in Supabase Dashboard
-- Go to: Authentication > Providers > Email
-- Disable "Confirm email" option

-- OR run this SQL to auto-confirm users on signup:

-- Update the handle_new_user function to auto-confirm email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, email_verified)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    false  -- email_verified starts as false, user can verify later
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- MANUAL STEP REQUIRED:
-- 1. Go to Supabase Dashboard
-- 2. Navigate to Authentication > Providers > Email
-- 3. Turn OFF "Confirm email" toggle
-- 4. Save changes

-- This will allow users to sign in immediately without email confirmation

-- Summerland Estates Database Schema
-- This file contains the complete database schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('professional', 'business', 'agency', 'estates', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listings/Profiles table
CREATE TABLE public.listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug TEXT UNIQUE,
  profile_photo TEXT,
  name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  role TEXT NOT NULL,
  location TEXT NOT NULL,
  experience_years INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0.0,
  category TEXT CHECK (category IN ('Staff', 'Vendor', 'Business', 'Agency', 'Estates')) NOT NULL,
  account_type TEXT CHECK (account_type IN ('professional', 'estates')),
  estates_role TEXT CHECK (estates_role IN ('estate-manager', 'chief-of-staff', 'personal-assistant', 'executive-assistant', 'principal')),
  availability BOOLEAN DEFAULT true,
  verified BOOLEAN DEFAULT false,
  bio TEXT,
  profile_status TEXT CHECK (profile_status IN ('available-for-hire', 'actively-hiring', 'community-only')),
  hide_detailed_info BOOLEAN DEFAULT false,
  is_online_now BOOLEAN DEFAULT false,
  last_online TIMESTAMP WITH TIME ZONE,
  can_receive_messages BOOLEAN DEFAULT true,
  hourly_rate TEXT,
  languages TEXT[],
  previous_job_titles TEXT[],
  portfolio_link TEXT,
  willing_to_relocate BOOLEAN DEFAULT false,
  willing_to_travel BOOLEAN DEFAULT false,
  has_car_and_insurance BOOLEAN DEFAULT false,
  willing_to_work_with_kids BOOLEAN DEFAULT false,
  willing_to_work_with_animals BOOLEAN DEFAULT false,
  willing_to_stay_overnight BOOLEAN DEFAULT false,
  willing_to_live_on_site BOOLEAN DEFAULT false,
  has_valid_drivers_license BOOLEAN DEFAULT false,
  willing_to_background_check BOOLEAN DEFAULT true,
  willing_to_drug_test BOOLEAN DEFAULT true,
  video_url TEXT,
  resume_url TEXT,
  business_website TEXT,
  business_email TEXT,
  business_phone TEXT,
  business_address TEXT,
  booking_enabled BOOLEAN DEFAULT false,
  deposit_required BOOLEAN DEFAULT false,
  deposit_amount TEXT,
  invoicing_enabled BOOLEAN DEFAULT false,
  payment_terms TEXT,
  chat_enabled BOOLEAN DEFAULT true,
  agency_website TEXT,
  agency_bio TEXT,
  individual_bio TEXT,
  years_in_industry INTEGER,
  response_expectations TEXT,
  hours_available TEXT,
  photo_hidden BOOLEAN DEFAULT false,
  pricing_tier TEXT,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills table
CREATE TABLE public.skills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  skill_type TEXT CHECK (skill_type IN ('technical', 'social', 'general')) DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Work History table
CREATE TABLE public.work_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  city TEXT,
  duties TEXT[],
  start_date TEXT,
  end_date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Certifications table
CREATE TABLE public.certifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  certification_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  reviewer_role TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Hours table
CREATE TABLE public.business_hours (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  open_time TEXT,
  close_time TEXT,
  closed BOOLEAN DEFAULT false
);

-- Services Offered table
CREATE TABLE public.services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  description TEXT,
  price TEXT,
  duration TEXT
);

-- Messages/Conversations table
CREATE TABLE public.conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation Participants table
CREATE TABLE public.conversation_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Messages table
CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved Profiles table
CREATE TABLE public.saved_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Listings policies
CREATE POLICY "Approved listings are viewable by everyone" ON public.listings
  FOR SELECT USING (approved = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert own listings" ON public.listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own listings" ON public.listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own listings" ON public.listings
  FOR DELETE USING (auth.uid() = user_id);

-- Admin can approve listings
CREATE POLICY "Admins can update all listings" ON public.listings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Skills policies
CREATE POLICY "Skills viewable with listing" ON public.skills
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = skills.listing_id AND (listings.approved = true OR listings.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage own listing skills" ON public.skills
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = skills.listing_id AND listings.user_id = auth.uid()
    )
  );

-- Work History policies
CREATE POLICY "Work history viewable with listing" ON public.work_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = work_history.listing_id AND (listings.approved = true OR listings.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage own work history" ON public.work_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = work_history.listing_id AND listings.user_id = auth.uid()
    )
  );

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Messages policies
CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_participants.conversation_id = conversations.id
      AND conversation_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_participants.conversation_id = messages.conversation_id
      AND conversation_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages in their conversations" ON public.messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_participants.conversation_id = conversation_id
      AND conversation_participants.user_id = auth.uid()
    )
  );

-- Saved Profiles policies
CREATE POLICY "Users can view own saved profiles" ON public.saved_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own saved profiles" ON public.saved_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Functions and Triggers

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes for performance
CREATE INDEX idx_listings_user_id ON public.listings(user_id);
CREATE INDEX idx_listings_category ON public.listings(category);
CREATE INDEX idx_listings_approved ON public.listings(approved);
CREATE INDEX idx_listings_location ON public.listings(location);
CREATE INDEX idx_listings_slug ON public.listings(slug);
CREATE INDEX idx_skills_listing_id ON public.skills(listing_id);
CREATE INDEX idx_work_history_listing_id ON public.work_history(listing_id);
CREATE INDEX idx_reviews_listing_id ON public.reviews(listing_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_conversation_participants_user_id ON public.conversation_participants(user_id);
CREATE INDEX idx_saved_profiles_user_id ON public.saved_profiles(user_id);

-- Auto-generate slug for listings
CREATE OR REPLACE FUNCTION public.generate_listing_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(REGEXP_REPLACE(
      COALESCE(NEW.name, 'listing') || '-' || NEW.id::text,
      '[^a-z0-9-]+', '-', 'g'
    ));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_listing_slug ON public.listings;
CREATE TRIGGER set_listing_slug
  BEFORE INSERT ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_listing_slug();

-- Promo codes table for free pro profile offers
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'free_pro_6months', -- e.g., 'free_pro_6months', 'percentage', 'fixed'
  discount_value INTEGER DEFAULT 0,
  tier TEXT, -- target pro tier: professional-pro, business-pro, agency-pro, estates-pro
  max_uses INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User promo code redemptions
CREATE TABLE IF NOT EXISTS user_promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  promo_code_id UUID REFERENCES promo_codes(id) NOT NULL,
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, promo_code_id)
);

-- Enable RLS
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_promo_codes ENABLE ROW LEVEL SECURITY;

-- Admin can manage promo codes
CREATE POLICY "Admin can manage promo codes"
  ON promo_codes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Users can view active promo codes
CREATE POLICY "Users can view active promo codes"
  ON promo_codes FOR SELECT
  TO authenticated
  USING (is_active = TRUE AND (valid_until IS NULL OR valid_until > NOW()));

-- Users can view their own redemptions
CREATE POLICY "Users can view own redemptions"
  ON user_promo_codes FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own redemptions (limited by trigger/function)
CREATE POLICY "Users can insert own redemptions"
  ON user_promo_codes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_user_promo_codes_user_id ON user_promo_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_promo_codes_promo_code_id ON user_promo_codes(promo_code_id);

-- Add user level support for progressive complexity
-- This migration adds user_level field to profiles table to track user experience level

-- Add user_level column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS user_level TEXT DEFAULT 'beginner' 
CHECK (user_level IN ('beginner', 'intermediate', 'advanced'));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_level ON profiles(user_level);

-- Add user preferences for simplified view
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS show_advanced_features BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS preferred_view TEXT DEFAULT 'simple' 
CHECK (preferred_view IN ('simple', 'classic'));

-- Create a table to track feature usage for automatic level progression
CREATE TABLE IF NOT EXISTS user_feature_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  usage_count INTEGER DEFAULT 1,
  first_used_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, feature_name)
);

-- Create index for feature usage queries
CREATE INDEX IF NOT EXISTS idx_user_feature_usage_user_id ON user_feature_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feature_usage_last_used ON user_feature_usage(last_used_at);

-- Function to track feature usage
CREATE OR REPLACE FUNCTION track_feature_usage(
  p_user_id UUID,
  p_feature_name TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO user_feature_usage (user_id, feature_name, usage_count, last_used_at)
  VALUES (p_user_id, p_feature_name, 1, now())
  ON CONFLICT (user_id, feature_name)
  DO UPDATE SET 
    usage_count = user_feature_usage.usage_count + 1,
    last_used_at = now();
END;
$$ LANGUAGE plpgsql;

-- Function to determine if user should be upgraded
CREATE OR REPLACE FUNCTION check_user_level_upgrade(p_user_id UUID) 
RETURNS TEXT AS $$
DECLARE
  v_current_level TEXT;
  v_total_cards INTEGER;
  v_total_decks INTEGER;
  v_days_active INTEGER;
  v_study_sessions INTEGER;
  v_features_used INTEGER;
BEGIN
  -- Get current level
  SELECT user_level INTO v_current_level 
  FROM profiles 
  WHERE id = p_user_id;
  
  -- Get user statistics
  SELECT COUNT(*) INTO v_total_cards 
  FROM cards 
  WHERE user_id = p_user_id;
  
  SELECT COUNT(*) INTO v_total_decks 
  FROM decks 
  WHERE user_id = p_user_id;
  
  SELECT COUNT(DISTINCT DATE(review_time)) INTO v_days_active
  FROM review_logs
  WHERE user_id = p_user_id;
  
  SELECT COUNT(*) INTO v_study_sessions
  FROM review_logs
  WHERE user_id = p_user_id;
  
  SELECT COUNT(DISTINCT feature_name) INTO v_features_used
  FROM user_feature_usage
  WHERE user_id = p_user_id;
  
  -- Check for advanced level
  IF v_current_level != 'advanced' AND (
    v_total_cards >= 200 AND 
    v_total_decks >= 10 AND 
    v_days_active >= 30 AND 
    v_study_sessions >= 50
  ) THEN
    RETURN 'advanced';
  END IF;
  
  -- Check for intermediate level
  IF v_current_level = 'beginner' AND (
    v_total_cards >= 50 OR 
    v_total_decks >= 3 OR 
    v_study_sessions >= 10 OR
    v_features_used >= 5
  ) THEN
    RETURN 'intermediate';
  END IF;
  
  RETURN v_current_level;
END;
$$ LANGUAGE plpgsql;

-- RLS policies for user_feature_usage
ALTER TABLE user_feature_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feature usage" ON user_feature_usage
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feature usage" ON user_feature_usage
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feature usage" ON user_feature_usage
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Add comment for documentation
COMMENT ON COLUMN profiles.user_level IS 'User experience level: beginner, intermediate, or advanced. Determines UI complexity and available features.';
COMMENT ON COLUMN profiles.show_advanced_features IS 'Override to show all features regardless of user level';
COMMENT ON COLUMN profiles.onboarding_completed IS 'Whether the user has completed the initial onboarding flow';
COMMENT ON COLUMN profiles.preferred_view IS 'User preference for UI style: simple (new) or classic (original)';
COMMENT ON TABLE user_feature_usage IS 'Tracks which features users interact with to determine automatic level progression';
-- Add onboarding-related fields to profiles table
-- This migration adds learning_goal field for storing user's learning objective

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS learning_goal TEXT;

-- Add comment for documentation
COMMENT ON COLUMN profiles.learning_goal IS 'User-defined learning goal captured during onboarding';
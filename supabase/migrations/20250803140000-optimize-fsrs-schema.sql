-- Optimize FSRS schema for better ts-fsrs integration
-- Add user-specific FSRS parameters and improve performance

-- Add FSRS parameters table for user-specific configurations
CREATE TABLE public.fsrs_parameters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- FSRS configuration as JSONB for flexibility
  parameters JSONB NOT NULL DEFAULT '{
    "request_retention": 0.9,
    "maximum_interval": 36500,
    "enable_fuzz": true,
    "enable_short_term": true,
    "learning_steps": ["1m", "10m"],
    "relearning_steps": ["10m"]
  }',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Enable RLS on fsrs_parameters table
ALTER TABLE public.fsrs_parameters ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for fsrs_parameters
CREATE POLICY "Users can view their own FSRS parameters" ON public.fsrs_parameters
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own FSRS parameters" ON public.fsrs_parameters
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own FSRS parameters" ON public.fsrs_parameters
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own FSRS parameters" ON public.fsrs_parameters
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_fsrs_parameters_updated_at
  BEFORE UPDATE ON public.fsrs_parameters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add FSRS card data as JSONB for easier serialization (optional optimization)
ALTER TABLE public.card_fsrs 
  ADD COLUMN fsrs_card_data JSONB DEFAULT NULL;

-- Add comment to explain the new column
COMMENT ON COLUMN public.card_fsrs.fsrs_card_data IS 'Complete FSRS Card object as JSONB for optimal ts-fsrs integration';

-- Improve indexes for better query performance
-- Drop existing indexes to recreate with better coverage
DROP INDEX IF EXISTS idx_card_fsrs_due_date;
DROP INDEX IF EXISTS idx_card_fsrs_state;

-- Create composite indexes for common query patterns  
CREATE INDEX idx_card_fsrs_user_due_state ON public.card_fsrs(user_id, due_date, state) 
  WHERE due_date IS NOT NULL;

CREATE INDEX idx_card_fsrs_user_state_due ON public.card_fsrs(user_id, state, due_date) 
  WHERE state IN ('Learning', 'Relearning');

-- Index for new cards (due_date IS NULL)
CREATE INDEX idx_card_fsrs_user_new_cards ON public.card_fsrs(user_id, created_at) 
  WHERE due_date IS NULL;

-- Update review_logs table to improve rollback performance
CREATE INDEX IF NOT EXISTS idx_review_logs_card_user_time ON public.review_logs(card_id, user_id, review_time DESC);

-- Add function to initialize default FSRS parameters for new users
CREATE OR REPLACE FUNCTION public.initialize_user_fsrs_parameters()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Insert default FSRS parameters for new user
  INSERT INTO public.fsrs_parameters (user_id, parameters)
  VALUES (
    NEW.id,
    '{
      "request_retention": 0.9,
      "maximum_interval": 36500,
      "enable_fuzz": true,
      "enable_short_term": true,
      "learning_steps": ["1m", "10m"],
      "relearning_steps": ["10m"]
    }'::jsonb
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-initialize FSRS parameters for new users
CREATE TRIGGER trigger_initialize_user_fsrs_parameters
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_fsrs_parameters();

-- Update study_cards view to use optimized indexes
DROP VIEW IF EXISTS public.study_cards CASCADE;

CREATE VIEW public.study_cards AS
SELECT *
FROM public.cards_with_details
WHERE 
  -- New cards (no due date) - uses idx_card_fsrs_user_new_cards
  due_date IS NULL 
  OR 
  -- Cards due today or overdue - uses idx_card_fsrs_user_due_state
  due_date::date <= CURRENT_DATE
  OR 
  -- Learning/Relearning cards due within next 30 minutes - uses idx_card_fsrs_user_state_due
  (
    (state = 'Learning' OR state = 'Relearning') 
    AND due_date <= NOW() + INTERVAL '30 minutes'
  )
ORDER BY 
  CASE 
    WHEN due_date IS NULL THEN 0           -- New cards first
    WHEN due_date <= NOW() THEN 1          -- Overdue/due now second  
    WHEN state = 'Learning' OR state = 'Relearning' THEN 2  -- Learning cards third
    ELSE 3                                 -- Future cards last
  END,
  due_date ASC NULLS FIRST;

-- Enable RLS on the study view
ALTER VIEW public.study_cards SET (security_invoker = true);

-- Comments for documentation
COMMENT ON TABLE public.fsrs_parameters IS 'User-specific FSRS algorithm parameters for personalized spaced repetition';
COMMENT ON COLUMN public.fsrs_parameters.parameters IS 'FSRS configuration including retention, intervals, and learning steps';
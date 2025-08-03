-- Fix learning_steps values for new cards to ensure consistent intervals
-- All cards in 'New' state should have learning_steps = 0 (step index 0)

-- Reset learning_steps to 0 for all cards in New state
UPDATE public.card_fsrs 
SET learning_steps = 0, 
    updated_at = NOW()
WHERE state = 'New' 
  AND learning_steps != 0;

-- Add a comment explaining the learning_steps field
COMMENT ON COLUMN public.card_fsrs.learning_steps IS 'Current learning step index (0, 1, 2...) - NOT the configuration array. New cards should always have learning_steps = 0';
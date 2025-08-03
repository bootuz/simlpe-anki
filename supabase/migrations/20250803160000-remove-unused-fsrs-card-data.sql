-- Remove unused fsrs_card_data column from card_fsrs table
-- This column was added as an optimization but is redundant since we have proper field mapping

-- Remove the unused fsrs_card_data column
ALTER TABLE public.card_fsrs 
  DROP COLUMN IF EXISTS fsrs_card_data;
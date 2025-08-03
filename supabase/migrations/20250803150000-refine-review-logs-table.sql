-- Refine review_logs table to use only review_log column
-- Remove redundant record_log column for cleaner FSRS integration

-- Remove the unused record_log column
ALTER TABLE public.review_logs 
  DROP COLUMN IF EXISTS record_log;

-- Update table comment to reflect the refined approach
COMMENT ON TABLE public.review_logs IS 'Stores FSRS review history for undo functionality using ts-fsrs rollback with single ReviewLog objects';

-- Update column comment for clarity
COMMENT ON COLUMN public.review_logs.review_log IS 'Single ReviewLog object from the chosen RecordLogItem for rollback functionality';
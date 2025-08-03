-- Update review_logs table to use ts-fsrs rollback approach
-- Remove previous_* fields and add record_log JSONB column

-- Drop old columns that stored previous state manually
ALTER TABLE public.review_logs 
  DROP COLUMN IF EXISTS state,
  DROP COLUMN IF EXISTS due_date,
  DROP COLUMN IF EXISTS stability,
  DROP COLUMN IF EXISTS difficulty,
  DROP COLUMN IF EXISTS elapsed_days,
  DROP COLUMN IF EXISTS scheduled_days,
  DROP COLUMN IF EXISTS reps,
  DROP COLUMN IF EXISTS lapses,
  DROP COLUMN IF EXISTS previous_state,
  DROP COLUMN IF EXISTS previous_due_date,
  DROP COLUMN IF EXISTS previous_stability,
  DROP COLUMN IF EXISTS previous_difficulty,
  DROP COLUMN IF EXISTS previous_elapsed_days,
  DROP COLUMN IF EXISTS previous_scheduled_days,
  DROP COLUMN IF EXISTS previous_reps,
  DROP COLUMN IF EXISTS previous_lapses,
  DROP COLUMN IF EXISTS previous_learning_steps;

-- Add new column for specific ReviewLog object (more storage efficient)
ALTER TABLE public.review_logs 
  ADD COLUMN IF NOT EXISTS review_log JSONB NOT NULL DEFAULT '{}';

-- Update comments
COMMENT ON TABLE public.review_logs IS 'Stores FSRS review history for undo functionality using ts-fsrs rollback';
COMMENT ON COLUMN public.review_logs.review_log IS 'Specific ReviewLog object from ts-fsrs for rollback functionality';
COMMENT ON COLUMN public.review_logs.rating IS 'FSRS rating given (0=Manual, 1=Again, 2=Hard, 3=Good, 4=Easy)';
COMMENT ON COLUMN public.review_logs.review_time IS 'When the review was performed';
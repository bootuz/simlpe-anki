-- First, make due_date column nullable
ALTER TABLE public.card_fsrs ALTER COLUMN due_date DROP NOT NULL;

-- Update existing New cards to have NULL due_date
UPDATE public.card_fsrs 
SET due_date = NULL 
WHERE state = 'New';

-- Update the trigger function to set due_date to NULL for new cards
CREATE OR REPLACE FUNCTION public.initialize_card_fsrs()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.card_fsrs (
    card_id,
    user_id,
    state,
    scheduled_days,
    reps,
    lapses,
    difficulty,
    stability,
    elapsed_days,
    learning_steps,
    due_date,
    last_review
  ) VALUES (
    NEW.id,
    NEW.user_id,
    'New',
    0,
    0,
    0,
    5.0,  -- Default difficulty in ts-fsrs
    0.1,  -- Default stability in ts-fsrs  
    0,
    0,
    NULL,  -- New cards have no due date until first review
    NULL
  );
  RETURN NEW;
END;
$function$;
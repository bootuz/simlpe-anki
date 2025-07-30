-- Update the trigger function to use proper ts-fsrs default values
-- These values match the createEmptyCard() function from ts-fsrs v5.2.1
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
    'New',                    -- State.New
    0,                        -- No scheduled days for new cards
    0,                        -- No repetitions yet
    0,                        -- No lapses yet
    5.0,                      -- Default difficulty from ts-fsrs
    0.1,                      -- Default stability from ts-fsrs
    0,                        -- No elapsed days for new cards
    0,                        -- Learning step 0 (first step)
    NULL,                     -- New cards have no due date until first review
    NULL                      -- No previous review
  );
  RETURN NEW;
END;
$function$;
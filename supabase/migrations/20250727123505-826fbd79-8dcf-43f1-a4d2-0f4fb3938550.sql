-- Fix security warning by updating function with proper search path
CREATE OR REPLACE FUNCTION public.initialize_card_fsrs()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
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
    now(),  -- New cards are due immediately
    NULL
  );
  RETURN NEW;
END;
$$;
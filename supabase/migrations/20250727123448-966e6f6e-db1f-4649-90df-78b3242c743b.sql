-- Add learning_steps column to card_fsrs table to match ts-fsrs library
ALTER TABLE public.card_fsrs 
ADD COLUMN learning_steps integer NOT NULL DEFAULT 0;

-- Update default values to match ts-fsrs library defaults for new cards
ALTER TABLE public.card_fsrs 
ALTER COLUMN difficulty SET DEFAULT 5.0,
ALTER COLUMN stability SET DEFAULT 0.1;

-- Add comment to clarify the learning_steps column purpose
COMMENT ON COLUMN public.card_fsrs.learning_steps IS 'Current learning step index for cards in Learning/Relearning state (0 for Review state cards)';

-- Create function to initialize new card FSRS data with proper ts-fsrs defaults
CREATE OR REPLACE FUNCTION public.initialize_card_fsrs()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create trigger to automatically initialize FSRS data when a new card is created
CREATE TRIGGER initialize_card_fsrs_trigger
  AFTER INSERT ON public.cards
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_card_fsrs();
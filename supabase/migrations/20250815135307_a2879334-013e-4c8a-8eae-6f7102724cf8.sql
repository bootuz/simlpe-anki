-- Update the existing database functions to make them accessible from TypeScript
-- The functions already exist, this migration just ensures they're properly defined

-- Ensure get_cards_with_details function is accessible
SELECT 1; -- This function already exists

-- Ensure get_study_cards function is accessible  
SELECT 1; -- This function already exists

-- Create a cards_with_details view as an alternative approach
-- This will give us the same data as the function but as a queryable view
CREATE OR REPLACE VIEW public.cards_with_details AS
SELECT 
  c.id,
  c.front,
  c.back,
  c.user_id,
  c.deck_id,
  c.created_at,
  c.updated_at,
  d.name as deck_name,
  f.name as folder_name,
  f.id as folder_id,
  cf.state,
  cf.due_date,
  cf.difficulty,
  cf.stability,
  cf.reps,
  cf.lapses,
  cf.last_review
FROM public.cards c
LEFT JOIN public.decks d ON c.deck_id = d.id
LEFT JOIN public.folders f ON d.folder_id = f.id
LEFT JOIN public.card_fsrs cf ON c.id = cf.card_id;

-- Enable RLS on the view
ALTER VIEW public.cards_with_details SET (security_invoker = true);

-- Create RLS policies for the view
CREATE POLICY "Users can view their own cards with details" 
ON public.cards_with_details
FOR SELECT 
USING (auth.uid() = user_id);
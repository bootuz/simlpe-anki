-- Drop both views with cascade to handle dependencies
DROP VIEW IF EXISTS public.study_cards CASCADE;
DROP VIEW IF EXISTS public.cards_with_details CASCADE;

-- Create a secure view that inherits RLS from underlying tables
CREATE VIEW public.cards_with_details 
WITH (security_invoker=true) AS
SELECT 
  c.id,
  c.front,
  c.back,
  c.user_id,
  c.deck_id,
  c.created_at,
  c.updated_at,
  c.tags,
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

-- Create a secure study_cards view
CREATE VIEW public.study_cards 
WITH (security_invoker=true) AS
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
  cf.last_review,
  CASE 
    WHEN cf.due_date IS NULL THEN 'new'
    ELSE 'ready'
  END as ready_status
FROM public.cards c
LEFT JOIN public.decks d ON c.deck_id = d.id
LEFT JOIN public.folders f ON d.folder_id = f.id
LEFT JOIN public.card_fsrs cf ON c.id = cf.card_id
WHERE (cf.due_date IS NULL OR cf.due_date <= NOW())
ORDER BY 
  CASE 
    WHEN cf.due_date IS NULL THEN 0
    ELSE 1
  END,
  cf.due_date ASC NULLS FIRST;
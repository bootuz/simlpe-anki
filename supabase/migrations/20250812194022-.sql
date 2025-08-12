-- Drop both views (cascade to handle dependencies)
DROP VIEW IF EXISTS public.study_cards CASCADE;
DROP VIEW IF EXISTS public.cards_with_details CASCADE;

-- Recreate the secure cards_with_details view
CREATE VIEW public.cards_with_details AS 
SELECT 
  c.id,
  c.front,
  c.back,
  c.user_id,
  c.deck_id,
  c.created_at,
  c.updated_at,
  d.name AS deck_name,
  f.name AS folder_name,
  f.id AS folder_id,
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

-- Recreate the study_cards view 
CREATE VIEW public.study_cards AS 
SELECT 
  id,
  front,
  back,
  user_id,
  deck_id,
  created_at,
  updated_at,
  deck_name,
  folder_name,
  folder_id,
  state,
  due_date,
  difficulty,
  stability,
  reps,
  lapses,
  last_review,
  CASE
    WHEN due_date IS NULL THEN 'new'::text
    ELSE 'ready'::text
  END AS ready_status
FROM public.cards_with_details
WHERE due_date IS NULL 
   OR (due_date IS NOT NULL AND (
     due_date <= now() 
     OR (state = 'Learning'::text OR state = 'Relearning'::text) 
     AND due_date <= (now() + '00:30:00'::interval)
   ))
ORDER BY (
  CASE
    WHEN due_date IS NULL THEN 0
    WHEN state = 'Learning'::text OR state = 'Relearning'::text THEN 1
    WHEN due_date <= (now() - '1 day'::interval) THEN 2
    WHEN due_date <= now() THEN 3
    ELSE 4
  END), due_date NULLS FIRST;

-- Add security comments
COMMENT ON VIEW public.cards_with_details IS 
'Secure view showing card details with FSRS data. Access restricted by RLS policies on underlying tables.';

COMMENT ON VIEW public.study_cards IS 
'Secure view showing cards ready for study. Inherits security from cards_with_details view.';
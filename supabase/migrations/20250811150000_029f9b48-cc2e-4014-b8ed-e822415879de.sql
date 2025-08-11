-- Fix SECURITY DEFINER views by recreating them as regular views
-- Drop dependent views first, then recreate all views

-- Drop study_cards first (depends on cards_with_details)
DROP VIEW IF EXISTS public.study_cards;

-- Drop other views
DROP VIEW IF EXISTS public.cards_with_details;
DROP VIEW IF EXISTS public.cards_with_tag_stats;

-- Recreate cards_with_details view (without SECURITY DEFINER)
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

-- Recreate cards_with_tag_stats view (without SECURITY DEFINER)
CREATE VIEW public.cards_with_tag_stats AS
SELECT 
  id,
  user_id,
  deck_id,
  front,
  back,
  created_at,
  updated_at,
  tags,
  array_length(tags, 1) AS tag_count
FROM public.cards;

-- Recreate study_cards view (without SECURITY DEFINER)
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
  last_review
FROM public.cards_with_details
WHERE (
  due_date IS NULL 
  OR due_date::date <= CURRENT_DATE 
  OR (
    (state = 'Learning' OR state = 'Relearning') 
    AND due_date <= (now() + interval '30 minutes')
  )
)
ORDER BY 
  CASE
    WHEN due_date IS NULL THEN 0
    WHEN due_date <= now() THEN 1
    WHEN (state = 'Learning' OR state = 'Relearning') THEN 2
    ELSE 3
  END, 
  due_date NULLS FIRST;
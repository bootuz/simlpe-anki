-- Fix SECURITY DEFINER views by recreating them as regular views
-- This addresses the critical security vulnerability where views bypass RLS

-- Drop and recreate cards_with_details view
DROP VIEW IF EXISTS public.cards_with_details;
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

-- Drop and recreate cards_with_tag_stats view
DROP VIEW IF EXISTS public.cards_with_tag_stats;
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

-- Drop and recreate study_cards view
DROP VIEW IF EXISTS public.study_cards;
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
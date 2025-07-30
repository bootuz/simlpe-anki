-- Fix security issues by dropping views in correct order

-- Drop dependent view first
DROP VIEW IF EXISTS public.study_cards CASCADE;
DROP VIEW IF EXISTS public.cards_with_details CASCADE;

-- Recreate views without SECURITY DEFINER issues
CREATE VIEW public.cards_with_details AS
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

CREATE VIEW public.study_cards AS
SELECT *
FROM public.cards_with_details
WHERE due_date IS NULL OR due_date <= NOW()
ORDER BY 
  CASE 
    WHEN due_date IS NULL THEN 0
    ELSE 1
  END,
  due_date ASC NULLS FIRST;

-- Fix function search path
DROP FUNCTION IF EXISTS public.get_deck_card_counts(UUID);

CREATE OR REPLACE FUNCTION public.get_deck_card_counts(p_user_id UUID)
RETURNS TABLE(deck_id UUID, card_count BIGINT)
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT d.id as deck_id, COUNT(c.id) as card_count
  FROM public.decks d
  LEFT JOIN public.cards c ON d.id = c.deck_id
  WHERE d.user_id = p_user_id
  GROUP BY d.id;
$$;
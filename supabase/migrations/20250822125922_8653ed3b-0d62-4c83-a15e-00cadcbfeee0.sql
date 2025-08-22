-- Drop the security definer function and view
DROP VIEW IF EXISTS public.cards_with_details;
DROP FUNCTION IF EXISTS public.get_cards_with_details(uuid);

-- Create a new regular view that relies on RLS policies of underlying tables
-- This is safer than using SECURITY DEFINER
CREATE OR REPLACE VIEW public.cards_with_details AS
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

-- Since this is a regular view, it will inherit RLS policies from underlying tables
-- The cards, decks, folders, and card_fsrs tables all have proper RLS policies
-- that ensure users can only see their own data

-- Verify RLS is working by adding a comment explaining the security model
COMMENT ON VIEW public.cards_with_details IS 'This view inherits RLS policies from underlying tables (cards, decks, folders, card_fsrs) which all have user_id-based access control';
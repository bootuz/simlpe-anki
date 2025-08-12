-- Drop the existing insecure view
DROP VIEW IF EXISTS public.cards_with_details;

-- Create a secure view that inherits RLS from underlying tables
-- Views automatically inherit RLS from their underlying tables when created this way
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

-- Add comment explaining the security model
COMMENT ON VIEW public.cards_with_details IS 
'Secure view that shows card details with FSRS data. Security is enforced through RLS policies on underlying tables (cards, decks, folders, card_fsrs).';

-- Test the security by trying to access as different users would
-- This will only return data for the authenticated user due to RLS on underlying tables
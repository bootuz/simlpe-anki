-- Drop the existing view and function
DROP VIEW IF EXISTS public.cards_with_details;
DROP FUNCTION IF EXISTS public.get_cards_with_details(uuid);

-- Create a new security definer function that enforces proper access control
CREATE OR REPLACE FUNCTION public.get_cards_with_details(p_user_id uuid DEFAULT NULL)
RETURNS TABLE(
  id uuid,
  front text,
  back text,
  user_id uuid,
  deck_id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  tags text[],
  deck_name text,
  folder_name text,
  folder_id uuid,
  state text,
  due_date timestamp with time zone,
  difficulty real,
  stability real,
  reps integer,
  lapses integer,
  last_review timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
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
  LEFT JOIN public.card_fsrs cf ON c.id = cf.card_id
  WHERE 
    -- Only return data for the authenticated user
    c.user_id = COALESCE(p_user_id, auth.uid())
    -- Additional security check to ensure auth.uid() is not null
    AND auth.uid() IS NOT NULL
    AND c.user_id = auth.uid();
$$;

-- Grant execute permission to authenticated users only
GRANT EXECUTE ON FUNCTION public.get_cards_with_details(uuid) TO authenticated;

-- Create a secure view that automatically filters by current user
CREATE OR REPLACE VIEW public.cards_with_details AS
SELECT * FROM public.get_cards_with_details(auth.uid());
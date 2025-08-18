-- Add Row Level Security to views
-- This migration fixes the security issue where views were accessible without proper RLS

-- Drop existing views since they don't have proper RLS protection
DROP VIEW IF EXISTS public.study_cards;
DROP VIEW IF EXISTS public.cards_with_details;
DROP VIEW IF EXISTS public.cards_with_tag_stats;

-- Recreate cards_with_details as a security definer function that respects RLS
CREATE OR REPLACE FUNCTION public.get_cards_with_details(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  front TEXT,
  back TEXT,
  user_id UUID,
  deck_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  deck_name TEXT,
  folder_name TEXT,
  folder_id UUID,
  state TEXT,
  due_date TIMESTAMPTZ,
  difficulty NUMERIC,
  stability NUMERIC,
  reps INTEGER,
  lapses INTEGER,
  last_review TIMESTAMPTZ
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
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
    -- Additional security check
    AND c.user_id = auth.uid();
$$;

-- Create a secure study_cards function that respects user boundaries
CREATE OR REPLACE FUNCTION public.get_study_cards(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  front TEXT,
  back TEXT,
  user_id UUID,
  deck_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  deck_name TEXT,
  folder_name TEXT,
  folder_id UUID,
  state TEXT,
  due_date TIMESTAMPTZ,
  difficulty NUMERIC,
  stability NUMERIC,
  reps INTEGER,
  lapses INTEGER,
  last_review TIMESTAMPTZ,
  ready_status TEXT
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
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
  WHERE 
    -- Only return data for the authenticated user
    c.user_id = COALESCE(p_user_id, auth.uid())
    -- Additional security check
    AND c.user_id = auth.uid()
    -- Only cards that are due or new
    AND (cf.due_date IS NULL OR cf.due_date <= NOW())
  ORDER BY 
    CASE 
      WHEN cf.due_date IS NULL THEN 0  -- New cards first
      ELSE 1
    END,
    cf.due_date ASC NULLS FIRST;
$$;

-- Create a secure cards_with_tag_stats function that respects user boundaries
CREATE OR REPLACE FUNCTION public.get_cards_with_tag_stats(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  front TEXT,
  back TEXT,
  user_id UUID,
  deck_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  tags TEXT[],
  tag_count INTEGER
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
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
    array_length(c.tags, 1) as tag_count
  FROM public.cards c
  WHERE 
    -- Only return data for the authenticated user
    c.user_id = COALESCE(p_user_id, auth.uid())
    -- Additional security check
    AND c.user_id = auth.uid();
$$;

-- Update the existing search_cards_by_tags function to be secure
DROP FUNCTION IF EXISTS public.search_cards_by_tags(TEXT[]);

CREATE OR REPLACE FUNCTION public.search_cards_by_tags(
  tag_query TEXT[], 
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  front TEXT,
  back TEXT,
  deck_id UUID,
  user_id UUID,
  tags TEXT[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT 
    c.id,
    c.front,
    c.back,
    c.deck_id,
    c.user_id,
    c.tags,
    c.created_at,
    c.updated_at
  FROM public.cards c
  WHERE 
    c.tags && tag_query
    -- Only return data for the authenticated user
    AND c.user_id = COALESCE(p_user_id, auth.uid())
    -- Additional security check
    AND c.user_id = auth.uid();
$$;

-- Grant execute permissions to authenticated users only
GRANT EXECUTE ON FUNCTION public.get_cards_with_details(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_study_cards(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_cards_with_tag_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_cards_by_tags(TEXT[], UUID) TO authenticated;

-- Revoke from public and anonymous
REVOKE EXECUTE ON FUNCTION public.get_cards_with_details(UUID) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.get_study_cards(UUID) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.get_cards_with_tag_stats(UUID) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.search_cards_by_tags(TEXT[], UUID) FROM public, anon;
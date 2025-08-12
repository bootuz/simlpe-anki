-- Fix SECURITY DEFINER functions that don't need elevated privileges
-- These functions should respect RLS policies instead of bypassing them

-- Fix get_deck_card_counts - remove SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_deck_card_counts(p_user_id uuid)
RETURNS TABLE(deck_id uuid, card_count bigint)
LANGUAGE sql
STABLE
SET search_path TO ''
AS $function$
  SELECT d.id as deck_id, COUNT(c.id) as card_count
  FROM public.decks d
  LEFT JOIN public.cards c ON d.id = c.deck_id
  WHERE d.user_id = p_user_id
  GROUP BY d.id;
$function$;

-- Fix get_user_tags - remove SECURITY DEFINER  
CREATE OR REPLACE FUNCTION public.get_user_tags(user_uuid uuid)
RETURNS TABLE(tag text, count bigint)
LANGUAGE sql
STABLE
SET search_path TO ''
AS $function$
  SELECT 
    unnest(tags) as tag,
    COUNT(*) as count
  FROM public.cards 
  WHERE user_id = user_uuid 
    AND tags IS NOT NULL 
    AND array_length(tags, 1) > 0
  GROUP BY tag
  ORDER BY count DESC, tag;
$function$;

-- Fix search_cards_by_tags - remove SECURITY DEFINER and add user filtering
CREATE OR REPLACE FUNCTION public.search_cards_by_tags(tag_query text[])
RETURNS TABLE(id uuid, front text, back text, deck_id uuid, user_id uuid, tags text[], created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE sql
STABLE
SET search_path TO ''
AS $function$
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
  WHERE c.tags && tag_query
    AND c.user_id = auth.uid();  -- Add user filtering for security
$function$;

COMMENT ON FUNCTION public.get_deck_card_counts IS 'Counts cards per deck for a specific user. Now respects RLS policies.';
COMMENT ON FUNCTION public.get_user_tags IS 'Gets tag statistics for a specific user. Now respects RLS policies.';
COMMENT ON FUNCTION public.search_cards_by_tags IS 'Searches cards by tags for authenticated user only. Now respects RLS policies.';
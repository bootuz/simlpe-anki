-- Fix function search path security issues by adding SET search_path TO ''

-- Fix search_cards_by_tags function
DROP FUNCTION IF EXISTS public.search_cards_by_tags(text[]);
CREATE OR REPLACE FUNCTION public.search_cards_by_tags(tag_query text[])
 RETURNS TABLE(id uuid, front text, back text, deck_id uuid, user_id uuid, tags text[], created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
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
  WHERE c.tags && tag_query;
$function$;

-- Fix get_user_tags function
DROP FUNCTION IF EXISTS public.get_user_tags(uuid);
CREATE OR REPLACE FUNCTION public.get_user_tags(user_uuid uuid)
 RETURNS TABLE(tag text, count bigint)
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
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
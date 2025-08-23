-- Fix remaining SECURITY DEFINER functions that should respect RLS
-- Convert data access functions to SECURITY INVOKER

-- Fix get_cards_with_tag_stats function
CREATE OR REPLACE FUNCTION public.get_cards_with_tag_stats(p_user_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, front text, back text, user_id uuid, deck_id uuid, created_at timestamp with time zone, updated_at timestamp with time zone, tags text[], tag_count integer)
 LANGUAGE sql
 STABLE SECURITY INVOKER  -- Changed to SECURITY INVOKER
 SET search_path TO ''
AS $function$
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
    c.user_id = COALESCE(p_user_id, auth.uid());
$function$;

-- Fix get_study_cards function  
CREATE OR REPLACE FUNCTION public.get_study_cards(p_user_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, front text, back text, user_id uuid, deck_id uuid, created_at timestamp with time zone, updated_at timestamp with time zone, deck_name text, folder_name text, folder_id uuid, state text, due_date timestamp with time zone, difficulty numeric, stability numeric, reps integer, lapses integer, last_review timestamp with time zone, ready_status text)
 LANGUAGE sql
 STABLE SECURITY INVOKER  -- Changed to SECURITY INVOKER
 SET search_path TO ''
AS $function$
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
    -- Only cards that are due or new
    AND (cf.due_date IS NULL OR cf.due_date <= NOW())
  ORDER BY 
    CASE 
      WHEN cf.due_date IS NULL THEN 0  -- New cards first
      ELSE 1
    END,
    cf.due_date ASC NULLS FIRST;
$function$;

-- Fix search_cards_by_tags function
CREATE OR REPLACE FUNCTION public.search_cards_by_tags(tag_query text[], p_user_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, front text, back text, deck_id uuid, user_id uuid, tags text[], created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY INVOKER  -- Changed to SECURITY INVOKER
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
  WHERE 
    c.tags && tag_query
    -- Only return data for the authenticated user
    AND c.user_id = COALESCE(p_user_id, auth.uid());
$function$;
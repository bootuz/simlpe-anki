-- Fix security definer view issues by enabling RLS on views and creating proper policies
-- This ensures views respect user-level data access controls

-- Enable RLS on the views
ALTER VIEW public.cards_with_details SET (security_barrier = true);
ALTER VIEW public.study_cards SET (security_barrier = true);

-- Since we can't enable RLS directly on views, we need to recreate them as security barrier views
-- or create RLS policies. Let's recreate them properly.

-- Drop and recreate views with proper security context
DROP VIEW IF EXISTS public.cards_with_details CASCADE;
DROP VIEW IF EXISTS public.study_cards CASCADE;

-- Create cards_with_details as a security barrier view
CREATE VIEW public.cards_with_details 
WITH (security_barrier = true) AS
SELECT 
    c.id,
    c.front,
    c.back,
    c.user_id,
    c.deck_id,
    c.created_at,
    c.updated_at,
    c.tags,
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
LEFT JOIN public.card_fsrs cf ON c.id = cf.card_id
WHERE c.user_id = auth.uid(); -- Explicit user filtering

-- Create study_cards as a security barrier view
CREATE VIEW public.study_cards 
WITH (security_barrier = true) AS
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
    cf.last_review,
    CASE 
        WHEN cf.due_date IS NULL THEN 'new'::text
        ELSE 'ready'::text
    END AS ready_status
FROM public.cards c
LEFT JOIN public.decks d ON c.deck_id = d.id
LEFT JOIN public.folders f ON d.folder_id = f.id
LEFT JOIN public.card_fsrs cf ON c.id = cf.card_id
WHERE c.user_id = auth.uid() -- Explicit user filtering
    AND (cf.due_date IS NULL OR cf.due_date <= NOW())
ORDER BY 
    CASE 
        WHEN cf.due_date IS NULL THEN 0
        ELSE 1
    END,
    cf.due_date ASC NULLS FIRST;

-- Grant permissions to authenticated users
GRANT SELECT ON public.cards_with_details TO authenticated;
GRANT SELECT ON public.study_cards TO authenticated;
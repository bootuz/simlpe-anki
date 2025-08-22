-- Fix SECURITY DEFINER views by recreating them without SECURITY DEFINER
-- This ensures they respect Row Level Security policies

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
WHERE c.user_id = auth.uid();

-- Drop and recreate study_cards view  
DROP VIEW IF EXISTS public.study_cards;

CREATE VIEW public.study_cards AS
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
        WHEN cf.due_date IS NULL THEN 'new'
        ELSE 'ready'
    END AS ready_status
FROM public.cards c
LEFT JOIN public.decks d ON c.deck_id = d.id
LEFT JOIN public.folders f ON d.folder_id = f.id
LEFT JOIN public.card_fsrs cf ON c.id = cf.card_id
WHERE c.user_id = auth.uid()
    AND (cf.due_date IS NULL OR cf.due_date <= NOW())
ORDER BY 
    CASE 
        WHEN cf.due_date IS NULL THEN 0  -- New cards first
        ELSE 1
    END,
    cf.due_date ASC NULLS FIRST;

-- Enable RLS on views (if supported)
ALTER VIEW public.cards_with_details SET (security_barrier = true);
ALTER VIEW public.study_cards SET (security_barrier = true);
-- Drop existing views
DROP VIEW IF EXISTS public.cards_with_details;
DROP VIEW IF EXISTS public.study_cards;

-- Recreate cards_with_details view with explicit security context
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
LEFT JOIN public.card_fsrs cf ON c.id = cf.card_id;

-- Recreate study_cards view with explicit security context  
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
        WHEN cf.due_date IS NULL THEN 'new'::text
        ELSE 'ready'::text
    END AS ready_status
FROM public.cards c
LEFT JOIN public.decks d ON c.deck_id = d.id
LEFT JOIN public.folders f ON d.folder_id = f.id
LEFT JOIN public.card_fsrs cf ON c.id = cf.card_id
WHERE (cf.due_date IS NULL OR cf.due_date <= NOW())
ORDER BY 
    CASE 
        WHEN cf.due_date IS NULL THEN 0
        ELSE 1
    END,
    cf.due_date ASC NULLS FIRST;

-- Grant appropriate permissions
GRANT SELECT ON public.cards_with_details TO authenticated;
GRANT SELECT ON public.study_cards TO authenticated;
-- Fix study_cards view to include learning cards due soon
-- This ensures "Again" cards don't disappear from study queue

DROP VIEW IF EXISTS public.study_cards CASCADE;

CREATE VIEW public.study_cards AS
SELECT *
FROM public.cards_with_details
WHERE 
  -- New cards (no due date)
  due_date IS NULL 
  OR 
  -- Cards due today or overdue (within current calendar day)
  due_date::date <= CURRENT_DATE
  OR 
  -- Learning/Relearning cards due within next 30 minutes
  -- This captures "Again" cards that get very short intervals
  (
    (state = 'Learning' OR state = 'Relearning') 
    AND due_date <= NOW() + INTERVAL '30 minutes'
  )
ORDER BY 
  CASE 
    -- Prioritize by urgency
    WHEN due_date IS NULL THEN 0           -- New cards first
    WHEN due_date <= NOW() THEN 1          -- Overdue/due now second  
    WHEN state = 'Learning' OR state = 'Relearning' THEN 2  -- Learning cards third
    ELSE 3                                 -- Future cards last
  END,
  due_date ASC NULLS FIRST;

-- Enable RLS on the study view
ALTER VIEW public.study_cards SET (security_invoker = true);
-- Simplify study cards view to use "New vs Ready" approach
-- This removes the anxiety-inducing "overdue" concept and focuses on optimal learning readiness

-- Drop existing study_cards view
DROP VIEW IF EXISTS public.study_cards CASCADE;

-- Create simplified study_cards view with "New vs Ready" logic
CREATE VIEW public.study_cards AS
SELECT *,
  -- Add ready status for easier filtering
  CASE 
    WHEN due_date IS NULL THEN 'new'
    ELSE 'ready'
  END as ready_status
FROM public.cards_with_details
WHERE 
  -- New cards (never reviewed)
  due_date IS NULL 
  OR 
  -- Ready cards (due for review based on FSRS algorithm)
  -- This includes what was previously "overdue", "due today", and learning cards
  (
    due_date IS NOT NULL 
    AND 
    (
      -- Cards that are due now or past due (ready for review)
      due_date <= NOW() 
      OR 
      -- Learning/Relearning cards due within next 30 minutes
      -- This ensures smooth learning progression without gaps
      (
        (state = 'Learning' OR state = 'Relearning') 
        AND due_date <= NOW() + INTERVAL '30 minutes'
      )
    )
  )
ORDER BY 
  -- Prioritize by learning optimization, not calendar urgency
  CASE 
    WHEN due_date IS NULL THEN 0                    -- New cards first (optimal for learning)
    WHEN state = 'Learning' OR state = 'Relearning' THEN 1  -- Learning progression second
    WHEN due_date <= NOW() - INTERVAL '1 day' THEN 2        -- Long-ready cards third  
    WHEN due_date <= NOW() THEN 3                           -- Recently ready cards fourth
    ELSE 4                                                   -- Future cards last
  END,
  -- Secondary sort by due date (oldest ready cards first)
  due_date ASC NULLS FIRST;

-- Enable RLS on the study view
ALTER VIEW public.study_cards SET (security_invoker = true);

-- Add helpful comments
COMMENT ON VIEW public.study_cards IS 'Simplified study queue using New vs Ready categorization for optimal learning experience';
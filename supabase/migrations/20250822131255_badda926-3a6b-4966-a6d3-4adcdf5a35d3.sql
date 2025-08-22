-- Enable Row Level Security on the views
ALTER VIEW public.cards_with_details ENABLE ROW LEVEL SECURITY;
ALTER VIEW public.study_cards ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for cards_with_details view to restrict access to user's own data
CREATE POLICY "Users can view their own cards with details"
ON public.cards_with_details
FOR SELECT
USING (auth.uid() = user_id);

-- Add RLS policy for study_cards view to restrict access to user's own data  
CREATE POLICY "Users can view their own study cards"
ON public.study_cards
FOR SELECT
USING (auth.uid() = user_id);
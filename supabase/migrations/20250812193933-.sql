-- Enable Row Level Security on the cards_with_details view
ALTER TABLE public.cards_with_details ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to ensure users can only access their own data
CREATE POLICY "Users can view their own cards with details" 
ON public.cards_with_details 
FOR SELECT 
USING (auth.uid() = user_id);

-- Verify the policy was created correctly
COMMENT ON POLICY "Users can view their own cards with details" ON public.cards_with_details 
IS 'Restricts access to cards_with_details view to authenticated users viewing only their own data';
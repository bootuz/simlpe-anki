-- Enable RLS on the cards_with_details view
ALTER TABLE public.cards_with_details ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to ensure users can only see their own data
CREATE POLICY "Users can only view their own card details" 
ON public.cards_with_details 
FOR SELECT 
USING (auth.uid() = user_id);
-- Enable Row Level Security on cards_with_details view
ALTER TABLE public.cards_with_details ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to ensure users can only view their own study data
CREATE POLICY "Users can only view their own study data" 
ON public.cards_with_details 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create additional policies for other operations (if needed)
-- Note: Since this is a view, typically only SELECT operations are relevant
-- but we'll add comprehensive policies for completeness

CREATE POLICY "Users can only insert their own study data" 
ON public.cards_with_details 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own study data" 
ON public.cards_with_details 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own study data" 
ON public.cards_with_details 
FOR DELETE 
USING (auth.uid() = user_id);
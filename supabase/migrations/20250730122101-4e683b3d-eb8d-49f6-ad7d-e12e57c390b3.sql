-- Drop existing RLS policies for card_fsrs table
DROP POLICY IF EXISTS "Users can create their own card FSRS data" ON public.card_fsrs;
DROP POLICY IF EXISTS "Users can delete their own card FSRS data" ON public.card_fsrs;
DROP POLICY IF EXISTS "Users can update their own card FSRS data" ON public.card_fsrs;
DROP POLICY IF EXISTS "Users can view their own card FSRS data" ON public.card_fsrs;

-- Create optimized RLS policies using (select auth.uid()) for better performance
CREATE POLICY "Users can create their own card FSRS data" 
ON public.card_fsrs 
FOR INSERT 
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own card FSRS data" 
ON public.card_fsrs 
FOR DELETE 
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own card FSRS data" 
ON public.card_fsrs 
FOR UPDATE 
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can view their own card FSRS data" 
ON public.card_fsrs 
FOR SELECT 
USING ((select auth.uid()) = user_id);
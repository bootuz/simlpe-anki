-- Drop existing RLS policies for cards table
DROP POLICY IF EXISTS "Users can create their own cards" ON public.cards;
DROP POLICY IF EXISTS "Users can delete their own cards" ON public.cards;
DROP POLICY IF EXISTS "Users can update their own cards" ON public.cards;
DROP POLICY IF EXISTS "Users can view their own cards" ON public.cards;

-- Create optimized RLS policies using (select auth.uid()) for better performance
CREATE POLICY "Users can create their own cards" 
ON public.cards 
FOR INSERT 
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own cards" 
ON public.cards 
FOR DELETE 
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own cards" 
ON public.cards 
FOR UPDATE 
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can view their own cards" 
ON public.cards 
FOR SELECT 
USING ((select auth.uid()) = user_id);
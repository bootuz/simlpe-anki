-- Drop existing RLS policies for decks table
DROP POLICY IF EXISTS "Users can create their own decks" ON public.decks;
DROP POLICY IF EXISTS "Users can delete their own decks" ON public.decks;
DROP POLICY IF EXISTS "Users can update their own decks" ON public.decks;
DROP POLICY IF EXISTS "Users can view their own decks" ON public.decks;

-- Create optimized RLS policies using (select auth.uid()) for better performance
CREATE POLICY "Users can create their own decks" 
ON public.decks 
FOR INSERT 
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own decks" 
ON public.decks 
FOR DELETE 
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own decks" 
ON public.decks 
FOR UPDATE 
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can view their own decks" 
ON public.decks 
FOR SELECT 
USING ((select auth.uid()) = user_id);
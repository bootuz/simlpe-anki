-- Drop existing RLS policies for folders table
DROP POLICY IF EXISTS "Users can create their own folders" ON public.folders;
DROP POLICY IF EXISTS "Users can delete their own folders" ON public.folders;
DROP POLICY IF EXISTS "Users can update their own folders" ON public.folders;
DROP POLICY IF EXISTS "Users can view their own folders" ON public.folders;

-- Create optimized RLS policies using (select auth.uid()) for better performance
CREATE POLICY "Users can create their own folders" 
ON public.folders 
FOR INSERT 
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own folders" 
ON public.folders 
FOR DELETE 
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own folders" 
ON public.folders 
FOR UPDATE 
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can view their own folders" 
ON public.folders 
FOR SELECT 
USING ((select auth.uid()) = user_id);
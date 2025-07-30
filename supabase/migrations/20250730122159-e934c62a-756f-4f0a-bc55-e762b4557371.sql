-- Drop existing RLS policies for profiles table
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create optimized RLS policies using (select auth.uid()) for better performance
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING ((select auth.uid()) = user_id);
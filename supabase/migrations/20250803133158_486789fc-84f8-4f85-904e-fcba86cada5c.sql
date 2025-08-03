-- Check if trigger exists and recreate it if needed
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically populate profiles table when new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also create trigger for FSRS parameters initialization  
DROP TRIGGER IF EXISTS on_auth_user_created_fsrs ON auth.users;

CREATE TRIGGER on_auth_user_created_fsrs
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_fsrs_parameters();
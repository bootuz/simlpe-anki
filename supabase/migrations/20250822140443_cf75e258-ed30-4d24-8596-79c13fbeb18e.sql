-- Fix remaining SECURITY DEFINER functions by changing to SECURITY INVOKER where appropriate
-- This addresses the security linter warnings about DEFINER functions

-- Update track_feature_usage to use SECURITY INVOKER since RLS handles access control
CREATE OR REPLACE FUNCTION public.track_feature_usage(p_user_id uuid, p_feature_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.user_feature_usage (user_id, feature_name, usage_count, last_used_at)
  VALUES (p_user_id, p_feature_name, 1, now())
  ON CONFLICT (user_id, feature_name)
  DO UPDATE SET 
    usage_count = public.user_feature_usage.usage_count + 1,
    last_used_at = now();
END;
$function$;

-- Update check_user_level_upgrade to use SECURITY INVOKER since RLS handles access control
CREATE OR REPLACE FUNCTION public.check_user_level_upgrade(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO ''
AS $function$
DECLARE
  v_current_level TEXT;
  v_total_cards INTEGER;
  v_total_decks INTEGER;
  v_days_active INTEGER;
  v_study_sessions INTEGER;
  v_features_used INTEGER;
BEGIN
  -- Get current level
  SELECT user_level INTO v_current_level 
  FROM public.profiles 
  WHERE id = p_user_id;
  
  -- Get user statistics  
  SELECT COUNT(*) INTO v_total_cards 
  FROM public.cards 
  WHERE user_id = p_user_id;
  
  SELECT COUNT(*) INTO v_total_decks 
  FROM public.decks 
  WHERE user_id = p_user_id;
  
  SELECT COUNT(DISTINCT DATE(review_time)) INTO v_days_active
  FROM public.review_logs
  WHERE user_id = p_user_id;
  
  SELECT COUNT(*) INTO v_study_sessions
  FROM public.review_logs
  WHERE user_id = p_user_id;
  
  SELECT COUNT(DISTINCT feature_name) INTO v_features_used
  FROM public.user_feature_usage
  WHERE user_id = p_user_id;
  
  -- Check for advanced level
  IF v_current_level != 'advanced' AND (
    v_total_cards >= 200 AND 
    v_total_decks >= 10 AND 
    v_days_active >= 30 AND 
    v_study_sessions >= 50
  ) THEN
    RETURN 'advanced';
  END IF;
  
  -- Check for intermediate level
  IF v_current_level = 'beginner' AND (
    v_total_cards >= 50 OR 
    v_total_decks >= 3 OR 
    v_study_sessions >= 10 OR
    v_features_used >= 5
  ) THEN
    RETURN 'intermediate';
  END IF;
  
  RETURN v_current_level;
END;
$function$;
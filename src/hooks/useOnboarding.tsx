import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  onboarding_completed: boolean;
  learning_goal: string | null;
  user_level: 'beginner' | 'intermediate' | 'advanced';
  show_advanced_features: boolean;
  preferred_view: 'simple' | 'classic';
  created_at: string;
  updated_at: string;
}

export function useOnboarding() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setLoading(false);
        setNeedsOnboarding(false);
        return;
      }

      try {
        // First, check if profile exists
        let { data: existingProfile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          // PGRST116 is "row not found" - other errors are real problems
          console.error('Error fetching profile:', error);
          setLoading(false);
          return;
        }

        // If no profile exists, create one
        if (!existingProfile) {
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              user_id: user.id,
              display_name: user.email?.split('@')[0] || 'User',
              onboarding_completed: false,
              user_level: 'beginner',
              show_advanced_features: false,
              preferred_view: 'simple'
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error creating profile:', insertError);
            setLoading(false);
            return;
          }

          existingProfile = newProfile;
        }

        // Handle case where profile doesn't exist in Supabase types
        const profileData = existingProfile as any;
        setProfile(profileData);
        setNeedsOnboarding(!profileData?.onboarding_completed);
      } catch (error) {
        console.error('Error in fetchProfile:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  const completeOnboarding = async () => {
    if (!user || !profile) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error completing onboarding:', error);
        return false;
      }

      setProfile(prev => prev ? { ...prev, onboarding_completed: true } : null);
      setNeedsOnboarding(false);
      return true;
    } catch (error) {
      console.error('Error in completeOnboarding:', error);
      return false;
    }
  };

  return {
    profile,
    loading,
    needsOnboarding,
    completeOnboarding
  };
}
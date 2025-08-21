import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// ============================================
// USER LEVEL MANAGEMENT SYSTEM
// ============================================

export type UserLevel = 'beginner' | 'intermediate' | 'advanced';

interface UserProgress {
  totalCards: number;
  totalDecks: number;
  daysActive: number;
  studySessions: number;
  averageAccuracy: number;
  featuresUsed: string[];
}

interface LevelThresholds {
  intermediate: {
    totalCards: 50;
    totalDecks: 3;
    daysActive: 7;
    studySessions: 10;
  };
  advanced: {
    totalCards: 200;
    totalDecks: 10;
    daysActive: 30;
    studySessions: 50;
  };
}

interface UserLevelContextType {
  level: UserLevel;
  progress: UserProgress;
  features: FeatureSet;
  canUpgrade: boolean;
  upgradeToNextLevel: () => void;
  toggleAdvancedMode: () => void;
  isAdvancedModeEnabled: boolean;
}

interface FeatureSet {
  // Beginner features (always available)
  createDeck: boolean;
  studyCards: boolean;
  basicStats: boolean;
  
  // Intermediate features
  folders: boolean;
  tags: boolean;
  advancedStats: boolean;
  customStudyModes: boolean;
  bulkOperations: boolean;
  
  // Advanced features
  customParameters: boolean;
  importExport: boolean;
  apiAccess: boolean;
  advancedOrganization: boolean;
  collaboration: boolean;
}

// ============================================
// CONTEXT PROVIDER
// ============================================

const UserLevelContext = createContext<UserLevelContextType | undefined>(undefined);

export const UserLevelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [level, setLevel] = useState<UserLevel>('beginner');
  const [progress, setProgress] = useState<UserProgress>({
    totalCards: 0,
    totalDecks: 0,
    daysActive: 0,
    studySessions: 0,
    averageAccuracy: 0,
    featuresUsed: []
  });
  const [isAdvancedModeEnabled, setIsAdvancedModeEnabled] = useState(false);

  // Feature availability based on level
  const getFeatures = (level: UserLevel): FeatureSet => {
    const baseFeatures = {
      createDeck: true,
      studyCards: true,
      basicStats: true,
      folders: false,
      tags: false,
      advancedStats: false,
      customStudyModes: false,
      bulkOperations: false,
      customParameters: false,
      importExport: false,
      apiAccess: false,
      advancedOrganization: false,
      collaboration: false
    };

    if (level === 'intermediate' || level === 'advanced') {
      baseFeatures.folders = true;
      baseFeatures.tags = true;
      baseFeatures.advancedStats = true;
      baseFeatures.customStudyModes = true;
      baseFeatures.bulkOperations = true;
    }

    if (level === 'advanced') {
      baseFeatures.customParameters = true;
      baseFeatures.importExport = true;
      baseFeatures.apiAccess = true;
      baseFeatures.advancedOrganization = true;
      baseFeatures.collaboration = true;
    }

    return baseFeatures;
  };

  // Load user progress and determine level
  useEffect(() => {
    if (!user) return;

    const loadUserProgress = async () => {
      try {
        // Get user statistics
        const [cardsResult, decksResult, sessionsResult] = await Promise.all([
          supabase
            .from('cards')
            .select('id', { count: 'exact' })
            .eq('user_id', user.id),
          supabase
            .from('decks')
            .select('id', { count: 'exact' })
            .eq('user_id', user.id),
          supabase
            .from('review_logs')
            .select('id, rating', { count: 'exact' })
            .eq('user_id', user.id)
        ]);

        const totalCards = cardsResult.count || 0;
        const totalDecks = decksResult.count || 0;
        const studySessions = sessionsResult.count || 0;

        // Calculate average accuracy from review logs
        let averageAccuracy = 0;
        if (sessionsResult.data && sessionsResult.data.length > 0) {
          const correctReviews = sessionsResult.data.filter(
            (log: any) => log.rating >= 3 // Good or Easy
          ).length;
          averageAccuracy = (correctReviews / sessionsResult.data.length) * 100;
        }

        // Calculate days active (simplified - in production, track actual activity)
        const accountCreated = new Date(user.created_at);
        const now = new Date();
        const daysActive = Math.floor((now.getTime() - accountCreated.getTime()) / (1000 * 60 * 60 * 24));

        const newProgress: UserProgress = {
          totalCards,
          totalDecks,
          daysActive,
          studySessions,
          averageAccuracy,
          featuresUsed: [] // Track feature usage separately
        };

        setProgress(newProgress);

        // Determine user level based on progress
        const determinedLevel = determineLevel(newProgress);
        setLevel(determinedLevel);

        // Save level to user preferences
        await saveUserLevel(determinedLevel);
      } catch (error) {
        console.error('Error loading user progress:', error);
      }
    };

    loadUserProgress();
  }, [user]);

  // Determine level based on progress
  const determineLevel = (progress: UserProgress): UserLevel => {
    const thresholds: LevelThresholds = {
      intermediate: {
        totalCards: 50,
        totalDecks: 3,
        daysActive: 7,
        studySessions: 10
      },
      advanced: {
        totalCards: 200,
        totalDecks: 10,
        daysActive: 30,
        studySessions: 50
      }
    };

    // Check for advanced level
    if (
      progress.totalCards >= thresholds.advanced.totalCards &&
      progress.totalDecks >= thresholds.advanced.totalDecks &&
      progress.daysActive >= thresholds.advanced.daysActive &&
      progress.studySessions >= thresholds.advanced.studySessions
    ) {
      return 'advanced';
    }

    // Check for intermediate level
    if (
      progress.totalCards >= thresholds.intermediate.totalCards ||
      progress.totalDecks >= thresholds.intermediate.totalDecks ||
      progress.studySessions >= thresholds.intermediate.studySessions
    ) {
      return 'intermediate';
    }

    return 'beginner';
  };

  // Save user level preference
  const saveUserLevel = async (level: UserLevel) => {
    if (!user) return;

    try {
      await supabase
        .from('profiles')
        .update({ 
          user_level: level,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
    } catch (error) {
      console.error('Error saving user level:', error);
    }
  };

  // Check if user can upgrade to next level
  const canUpgrade = (): boolean => {
    if (level === 'advanced') return false;

    const thresholds: LevelThresholds = {
      intermediate: {
        totalCards: 50,
        totalDecks: 3,
        daysActive: 7,
        studySessions: 10
      },
      advanced: {
        totalCards: 200,
        totalDecks: 10,
        daysActive: 30,
        studySessions: 50
      }
    };

    const targetThreshold = level === 'beginner' ? thresholds.intermediate : thresholds.advanced;

    return (
      progress.totalCards >= targetThreshold.totalCards * 0.8 || // 80% of target
      progress.studySessions >= targetThreshold.studySessions * 0.8
    );
  };

  // Manually upgrade to next level
  const upgradeToNextLevel = () => {
    if (level === 'beginner') {
      setLevel('intermediate');
      saveUserLevel('intermediate');
    } else if (level === 'intermediate') {
      setLevel('advanced');
      saveUserLevel('advanced');
    }
  };

  // Toggle advanced mode (for users who want full features immediately)
  const toggleAdvancedMode = () => {
    setIsAdvancedModeEnabled(!isAdvancedModeEnabled);
    if (!isAdvancedModeEnabled) {
      setLevel('advanced');
      saveUserLevel('advanced');
    } else {
      const naturalLevel = determineLevel(progress);
      setLevel(naturalLevel);
      saveUserLevel(naturalLevel);
    }
  };

  const contextValue: UserLevelContextType = {
    level,
    progress,
    features: getFeatures(level),
    canUpgrade: canUpgrade(),
    upgradeToNextLevel,
    toggleAdvancedMode,
    isAdvancedModeEnabled
  };

  return (
    <UserLevelContext.Provider value={contextValue}>
      {children}
    </UserLevelContext.Provider>
  );
};

// ============================================
// HOOK FOR USING USER LEVEL
// ============================================

export const useUserLevel = () => {
  const context = useContext(UserLevelContext);
  if (!context) {
    throw new Error('useUserLevel must be used within UserLevelProvider');
  }
  return context;
};

// ============================================
// LEVEL UP NOTIFICATION COMPONENT
// ============================================

export const LevelUpNotification: React.FC<{
  newLevel: UserLevel;
  onClose: () => void;
}> = ({ newLevel, onClose }) => {
  const levelInfo = {
    intermediate: {
      title: 'Level Up! 🎉',
      subtitle: 'You\'ve unlocked Intermediate features',
      features: [
        'Organize with folders',
        'Tag your cards',
        'Advanced statistics',
        'Custom study modes',
        'Bulk operations'
      ]
    },
    advanced: {
      title: 'Master Level Achieved! 🏆',
      subtitle: 'You now have access to all features',
      features: [
        'Custom FSRS parameters',
        'Import/Export data',
        'API access',
        'Advanced organization',
        'Collaboration tools'
      ]
    }
  };

  const info = newLevel === 'intermediate' ? levelInfo.intermediate : levelInfo.advanced;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6 space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🎉</span>
          </div>
          <h2 className="text-2xl font-bold">{info.title}</h2>
          <p className="text-muted-foreground mt-2">{info.subtitle}</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-muted-foreground">NEW FEATURES UNLOCKED:</p>
          <ul className="space-y-2">
            {info.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Awesome! Let's explore
        </button>
      </div>
    </div>
  );
};

export default useUserLevel;
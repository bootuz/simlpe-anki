import { useState, useEffect } from "react";
import { getDueDateInfo } from "@/utils/fsrsUtils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserLevel } from "@/hooks/useUserLevel";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useCardsWithDetails, useRealtimeSubscription } from "@/hooks/useOptimizedQueries";
import HomeHeader from "./home/HomeHeader";
import EmptyState from "./home/EmptyState";
import CaughtUp from "./home/CaughtUp";
import StudyReady from "./home/StudyReady";
import { Onboarding } from "@/components/Onboarding";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, GraduationCap, Brain, TrendingUp, Target, Sparkles, Plus, Zap, Clock, Folder, Trophy, Star } from "lucide-react";
interface CardWithDue {
  id: string;
  front: string;
  back: string;
  deck_id: string;
  deck_name: string;
  folder_name: string;
  due_date: string | null;
  created_at: string;
}

const Home = () => {
  const { user, loading, signOut } = useAuth();
  const { level, progress, features } = useUserLevel();
  const { needsOnboarding, loading: onboardingLoading, completeOnboarding } = useOnboarding();
  const navigate = useNavigate();
  
  // Use optimized query hook with caching
  const { data: cardsData, isLoading: cardsLoading, error: cardsError } = useCardsWithDetails();
  const { subscribeToCards } = useRealtimeSubscription();
  
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({});

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Set up real-time subscription for automatic updates
  useEffect(() => {
    if (!user) return;
    return subscribeToCards();
  }, [user, subscribeToCards]);

  // Handle query errors
  useEffect(() => {
    if (cardsError) {
      console.error("Error loading cards:", cardsError);
    }
  }, [cardsError]);

  // Transform cards data from the optimized query
  const cards: CardWithDue[] = (cardsData || []).map(card => ({
    id: card.id,
    front: card.front,
    back: card.back,
    deck_id: card.deck_id,
    deck_name: card.deck_name || 'Uncategorized Deck',
    folder_name: card.folder_name || 'Personal',
    due_date: (card as any).due_date,
    created_at: card.created_at
  }));

  const totalCards = cards.length;

  const formatExactDueTime = (dueDate: string) => {
    if (!dueDate) return null;
    
    const due = new Date(dueDate);
    const now = new Date();
    
    // Check for invalid dates
    if (isNaN(due.getTime())) return null;
    
    const diffMs = due.getTime() - now.getTime();

    if (diffMs < 0) {
      // Overdue - show how long ago
      const absDiffMs = Math.abs(diffMs);
      const minutes = Math.ceil(absDiffMs / (1000 * 60));
      
      if (minutes < 60) {
        return `${minutes}m ago`;
      } else if (minutes < 24 * 60) {
        const hours = Math.ceil(minutes / 60);
        return `${hours}h ago`;
      } else {
        const days = Math.ceil(minutes / (60 * 24));
        return `${days}d ago`;
      }
    } else {
      // Due in future - show exact time
      const seconds = Math.ceil(diffMs / 1000);
      const minutes = Math.ceil(diffMs / (1000 * 60));
      
      if (seconds <= 30) {
        return 'Due now';
      } else if (minutes < 60) {
        return `Due in ${minutes}m`;
      } else if (minutes < 24 * 60) {
        const hours = Math.ceil(minutes / 60);
        return `Due in ${hours}h`;
      } else {
        // For dates more than 24h away, show the actual date and time
        const isToday = due.toDateString() === now.toDateString();
        const isTomorrow = due.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
        
        if (isToday) {
          return `Due at ${due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else if (isTomorrow) {
          return `Due tomorrow at ${due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else {
          return `Due ${due.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
      }
    }
  };

  const getDueDateStatus = (
    dueDate: string | null
  ): { status: 'new' | 'ready' | 'future'; label: string; timeUntil?: number } => {
    const info = getDueDateInfo(dueDate);
    
    // For new cards, don't format exact time - just use the info label
    let label = info.label;
    if (dueDate && info.status !== 'new') {
      const exactLabel = formatExactDueTime(dueDate);
      label = exactLabel || info.label;
    }
    
    // Use the new simplified status directly from FSRS utils
    return { 
      status: info.status, 
      timeUntil: info.timeValue, 
      label: label
    } as const;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const toggleAnswer = (cardId: string) => {
    setShowAnswers(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const handleStartStudy = () => {
    navigate("/study");
  };

  const handleManageDecks = () => {
    navigate("/manage");
  };

  // Show loading while checking auth or loading data
  if (loading || cardsLoading || onboardingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your flashcards...</p>
        </div>
      </div>
    );
  }

  // Show onboarding if user needs it
  if (needsOnboarding) {
    return (
      <Onboarding onComplete={completeOnboarding} />
    );
  }

  // Cards that are ready for study (new or ready)
  const cardsToStudy = cards.filter(card => {
    const { status } = getDueDateStatus(card.due_date);
    return status === 'new' || status === 'ready';
  });

  // Separate new and ready cards for the two-category layout
  const newCards = cardsToStudy.filter(card => {
    const { status } = getDueDateStatus(card.due_date);
    return status === 'new';
  });

  const readyCards = cardsToStudy.filter(card => {
    const { status } = getDueDateStatus(card.due_date);
    return status === 'ready';
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
      </div>
      
      <div className="relative z-10">
        <HomeHeader onManageDecks={handleManageDecks} onSignOut={handleSignOut} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Beginner Progress Section */}
          {level === 'beginner' && totalCards > 0 && (
            <div className="mb-8 bg-card/60 backdrop-blur-sm rounded-xl border border-border/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Your Learning Journey
                </h2>
                {progress.totalCards >= 20 && (
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Making Progress!
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{progress.totalCards}</div>
                  <div className="text-sm text-muted-foreground">Total Cards</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{progress.studySessions}</div>
                  <div className="text-sm text-muted-foreground">Study Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{progress.daysActive}</div>
                  <div className="text-sm text-muted-foreground">Days Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {progress.averageAccuracy ? `${Math.round(progress.averageAccuracy)}%` : 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </div>
              </div>
              
              {/* Encouragement Message */}
              {progress.totalCards < 50 && (
                <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                  <p className="text-sm text-primary">
                    💡 <span className="font-semibold">Tip:</span> Create at least 50 cards to unlock more features!
                    You're {Math.round((progress.totalCards / 50) * 100)}% there.
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Main Content */}
          {totalCards === 0 ? (
            <EmptyState onManageDecks={handleManageDecks} />
          ) : cardsToStudy.length === 0 ? (
            <CaughtUp onManageDecks={handleManageDecks} />
          ) : (
            <StudyReady
              cards={cardsToStudy}
              getDueDateStatus={getDueDateStatus}
              onStartStudy={handleStartStudy}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
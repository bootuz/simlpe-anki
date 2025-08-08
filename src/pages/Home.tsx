import { useState, useEffect } from "react";
import { getDueDateInfo } from "@/utils/fsrsUtils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCardsWithDetails, useRealtimeSubscription } from "@/hooks/useOptimizedQueries";
import HomeHeader from "./home/HomeHeader";
import EmptyState from "./home/EmptyState";
import CaughtUp from "./home/CaughtUp";
import StudyReady from "./home/StudyReady";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, GraduationCap, Brain, TrendingUp, Target, Sparkles, Plus, Zap, Clock, Folder } from "lucide-react";
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
    due_date: card.due_date,
    created_at: card.created_at
  }));

  const totalCards = cards.length;

  const formatExactDueTime = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
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
  ): { status: 'new' | 'overdue' | 'due-today' | 'future'; label: string; daysUntilDue?: number } => {
    // Handle null due_date for new cards
    if (!dueDate) {
      return { status: 'new', daysUntilDue: 0, label: 'New' };
    }

    const info = getDueDateInfo(dueDate);
    const exactLabel = formatExactDueTime(dueDate);
    
    // Map FSRS status to Home page status for compatibility
    switch (info.status) {
      case 'overdue':
        return { 
          status: 'overdue', 
          daysUntilDue: info.timeValue, 
          label: exactLabel 
        } as const;
      case 'due-now':
        return { 
          status: 'due-today', 
          daysUntilDue: 0, 
          label: exactLabel 
        } as const;
      case 'due-soon': {
        // Check if card is due today (same calendar day)
        const due = new Date(dueDate);
        const now = new Date();
        const isToday = due.toDateString() === now.toDateString();
        
        if (isToday) {
          return { 
            status: 'due-today', 
            daysUntilDue: 0, 
            label: exactLabel 
          } as const;
        }
        // Cards due tomorrow or later are future
        return { 
          status: 'future', 
          daysUntilDue: info.timeValue, 
          label: exactLabel 
        } as const;
      }
      default:
        return { 
          status: 'future', 
          daysUntilDue: info.timeValue, 
          label: exactLabel 
        } as const;
    }
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
  if (loading || cardsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your flashcards...</p>
        </div>
      </div>
    );
  }

  // Cards that are due for study (overdue, due today, or new)
  const cardsToStudy = cards.filter(card => {
    const { status } = getDueDateStatus(card.due_date);
    return status === 'overdue' || status === 'due-today' || status === 'new';
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
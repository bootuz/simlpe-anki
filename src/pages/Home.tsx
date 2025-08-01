import { useState, useEffect } from "react";
import { getDueDateInfo, isCardDueForStudy } from "@/utils/fsrsUtils";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, TrendingUp, LogOut, Plus, GraduationCap, Brain, Target, Sparkles, Clock, Users, BarChart3, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCardsWithDetails, useRealtimeSubscription } from "@/hooks/useOptimizedQueries";

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

  const getDueDateStatus = (dueDate: string | null) => {
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
        };
      case 'due-now':
        return { 
          status: 'due-today', 
          daysUntilDue: 0, 
          label: exactLabel 
        };
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
          };
        }
        // Cards due tomorrow or later are future
        return { 
          status: 'future', 
          daysUntilDue: info.timeValue, 
          label: exactLabel 
        };
      }
      default:
        return { 
          status: 'future', 
          daysUntilDue: info.timeValue, 
          label: exactLabel 
        };
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
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Simple Anki</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={handleManageDecks}>
                <Plus className="h-4 w-4 mr-2" />
                Manage Cards
              </Button>
              <Button variant="ghost" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Main Content */}
        {totalCards === 0 ? (
          /* Enhanced New User Experience */
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="relative mb-8">
                {/* Enhanced icon design */}
                <div className="relative mx-auto w-32 h-32 mb-6">
                  {/* Background decoration */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/20 to-accent/10 rounded-full blur-2xl scale-110"></div>
                  
                  {/* Main icon container */}
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl animate-pulse"></div>
                    <div className="relative bg-background border-2 border-primary/20 rounded-2xl p-8 shadow-lg w-32 h-32 flex items-center justify-center">
                      <GraduationCap className="h-16 w-16 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                Start Your Learning Journey
              </h2>
              <p className="text-xl text-muted-foreground/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                Master any subject with spaced repetition. Create flashcards, organize them into decks, 
                and let our smart algorithm optimize your learning.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="group text-center p-6 rounded-lg bg-card border border-border/50 hover:shadow-md transition-all duration-200 hover:border-primary/20">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  <Brain className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-3 text-lg">Smart Learning</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Advanced FSRS algorithm shows you cards precisely when you're about to forget them
                </p>
              </div>
              <div className="group text-center p-6 rounded-lg bg-card border border-border/50 hover:shadow-md transition-all duration-200 hover:border-green-500/20">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  <TrendingUp className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="font-semibold mb-3 text-lg">Track Progress</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Monitor your learning journey with detailed analytics and progress insights
                </p>
              </div>
              <div className="group text-center p-6 rounded-lg bg-card border border-border/50 hover:shadow-md transition-all duration-200 hover:border-blue-500/20">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  <Target className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-3 text-lg">Efficient Study</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Focus on what matters most with personalized study schedules and priorities
                </p>
              </div>
            </div>

            {/* Card Preview */}
            <div className="mb-12">
              <h3 className="text-2xl font-semibold text-center mb-8">See How It Works</h3>
              <div className="max-w-sm mx-auto">
                <div className="group cursor-pointer">
                  <div className="relative bg-gradient-to-br from-primary via-primary to-accent text-white p-8 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <div className="text-center space-y-6">
                      <div>
                        <p className="text-sm opacity-80 mb-3 uppercase tracking-wide">Question</p>
                        <h4 className="text-xl font-semibold leading-tight">What is the capital of France?</h4>
                      </div>
                      <div className="border-t border-white/20 pt-6">
                        <p className="text-sm opacity-80 mb-3 uppercase tracking-wide">Answer</p>
                        <p className="text-xl font-medium">Paris</p>
                      </div>
                    </div>
                    
                    {/* Decorative elements */}
                    <div className="absolute top-4 right-4 opacity-20">
                      <Sparkles className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handleManageDecks} 
                size="lg" 
                className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-primary/25 transition-all duration-200"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create your first cards
              </Button>
            </div>
          </div>
        ) : cardsToStudy.length === 0 ? (
          /* All Caught Up */
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-4">All Caught Up! 🎉</h2>
              <p className="text-muted-foreground mb-8">
                Great job! You've reviewed all your cards that are due today. 
                Keep up the great work and check back later for more reviews.
              </p>
              <div className="flex justify-center">
                <Button variant="outline" onClick={handleManageDecks}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add More Cards
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Cards Due for Review - Enhanced Design */
          <div className="space-y-8">
            {/* Header with Stats */}
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 mb-4">
                <BookOpen className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">Ready to Study!</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  You have <span className="font-semibold text-primary">{cardsToStudy.length}</span> cards ready for review
                </p>
              </div>
              
              {/* Study Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                <div className="bg-card border rounded-lg p-4">
                  <div className="text-2xl font-bold text-primary">{cardsToStudy.filter(c => getDueDateStatus(c.due_date).status === 'new').length}</div>
                  <div className="text-sm text-muted-foreground">New Cards</div>
                </div>
                <div className="bg-card border rounded-lg p-4">
                  <div className="text-2xl font-bold text-orange-600">{cardsToStudy.filter(c => getDueDateStatus(c.due_date).status === 'due-today').length}</div>
                  <div className="text-sm text-muted-foreground">Due Today</div>
                </div>
                <div className="bg-card border rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600">{cardsToStudy.filter(c => getDueDateStatus(c.due_date).status === 'overdue').length}</div>
                  <div className="text-sm text-muted-foreground">Overdue</div>
                </div>
              </div>

              {/* Prominent CTA */}
              <Button onClick={handleStartStudy} size="lg" className="px-8 py-6 text-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-primary/25">
                <Zap className="h-6 w-6 mr-2" />
                Start Studying Now
              </Button>
            </div>

            {/* Individual Cards Timeline */}
            <div className="space-y-8">
              <div className="flex items-center justify-between max-w-4xl mx-auto">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Study Queue</h3>
                    <p className="text-sm text-muted-foreground">Prioritized by urgency</p>
                  </div>
                </div>
                <Badge variant="secondary" className="px-3 py-1">
                  {cardsToStudy.length} cards
                </Badge>
              </div>
              <div className="space-y-3 max-w-4xl mx-auto">
                {cardsToStudy.slice(0, 8).map((card, index) => {
                  const { status, label } = getDueDateStatus(card.due_date);
                  const cardBgClass = status === 'new' 
                    ? 'bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300 dark:bg-green-950/50 dark:border-green-800 dark:hover:bg-green-900/50 dark:hover:border-green-700'
                    : status === 'overdue'
                    ? 'bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300 dark:bg-red-950/50 dark:border-red-800 dark:hover:bg-red-900/50 dark:hover:border-red-700'
                    : 'bg-orange-50 border-orange-200 hover:bg-orange-100 hover:border-orange-300 dark:bg-orange-950/50 dark:border-orange-800 dark:hover:bg-orange-900/50 dark:hover:border-orange-700';
                  
                  return (
                    <div key={card.id} className={`group relative ${cardBgClass} rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge 
                              variant={status === 'overdue' ? 'destructive' : status === 'new' ? 'default' : 'secondary'}
                              className="text-xs shrink-0"
                            >
                              {status === 'new' ? 'New' : status === 'overdue' ? 'Overdue' : 'Due'}
                            </Badge>
                            <span className="text-xs text-muted-foreground truncate">
                              {card.deck_name}
                            </span>
                          </div>
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                            {card.front}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3 ml-4">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {label}
                          </span>
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs font-medium">{index + 1}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {cardsToStudy.length > 8 && (
                  <div className="text-center pt-4">
                    <p className="text-sm text-muted-foreground">
                      And {cardsToStudy.length - 8} more cards waiting...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
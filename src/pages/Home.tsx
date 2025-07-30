import { useState, useEffect } from "react";
import { getDueDateInfo, isCardDueForStudy } from "@/utils/fsrsUtils";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, BarChart3, LogOut, Clock, Calendar, Plus } from "lucide-react";
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
    deck_name: card.deck_name || 'Unknown Deck',
    folder_name: card.folder_name || 'Unknown Folder',
    due_date: card.due_date,
    created_at: card.created_at
  }));

  const totalCards = cards.length;

  const getDueDateStatus = (dueDate: string | null) => {
    // Handle null due_date for new cards
    if (!dueDate) {
      return { status: 'new', daysUntilDue: 0, label: 'New' };
    }

    const info = getDueDateInfo(dueDate);
    
    // Map FSRS status to Home page status for compatibility
    switch (info.status) {
      case 'overdue':
        return { 
          status: 'overdue', 
          daysUntilDue: info.timeValue, 
          label: info.label 
        };
      case 'due-now':
      case 'due-soon':
        return { 
          status: 'due-today', 
          daysUntilDue: 0, 
          label: info.label 
        };
      default:
        return { 
          status: 'future', 
          daysUntilDue: info.timeValue, 
          label: info.label 
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
                <div className="w-32 h-32 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=128&h=128&fit=crop&crop=center"
                    alt="Learning illustration"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-4">Start Your Learning Journey</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Master any subject with spaced repetition. Create flashcards, organize them into decks, 
                and let our smart algorithm optimize your learning.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="text-center p-6 rounded-lg bg-card border border-border/50">
                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Smart Learning</h3>
                <p className="text-sm text-muted-foreground">
                  Our spaced repetition system shows you cards just when you're about to forget them
                </p>
              </div>
              <div className="text-center p-6 rounded-lg bg-card border border-border/50">
                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-accent/10 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Track Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor your learning with detailed statistics and progress tracking
                </p>
              </div>
              <div className="text-center p-6 rounded-lg bg-card border border-border/50">
                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-secondary-foreground" />
                </div>
                <h3 className="font-semibold mb-2">Efficient Study</h3>
                <p className="text-sm text-muted-foreground">
                  Study smarter, not harder. Focus on what you need to review most
                </p>
              </div>
            </div>

            {/* Card Preview */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-center mb-6">See How It Works</h3>
              <div className="max-w-md mx-auto">
                <div className="bg-gradient-to-br from-primary to-accent text-white p-6 rounded-lg shadow-lg">
                  <div className="text-center">
                    <p className="text-sm opacity-90 mb-2">Question</p>
                    <h4 className="text-lg font-medium mb-4">What is the capital of France?</h4>
                    <div className="border-t border-white/20 pt-4">
                      <p className="text-sm opacity-90 mb-2">Answer</p>
                      <p className="text-lg">Paris</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button onClick={handleManageDecks} size="lg" className="w-full sm:w-auto">
                <Plus className="h-5 w-5 mr-2" />
                Create your first cards
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <BookOpen className="h-5 w-5 mr-2" />
                View Example Deck
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
          /* Cards Due for Review */
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Cards Due for Review</h2>
                <p className="text-muted-foreground">
                  You have {cardsToStudy.length} cards ready to study
                </p>
              </div>
              <Button onClick={handleStartStudy} size="lg">
                <BookOpen className="h-5 w-5 mr-2" />
                Start Studying
              </Button>
            </div>

            {/* Cards List */}
            <div className="space-y-4">
              {cardsToStudy.slice(0, 6).map((card) => {
                const dueDateInfo = getDueDateStatus(card.due_date);
                return (
                  <Card key={card.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => toggleAnswer(card.id)}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            {card.folder_name} → {card.deck_name}
                          </CardTitle>
                        </div>
                        <Badge 
                          variant={dueDateInfo.status === 'overdue' ? 'destructive' : 
                                  dueDateInfo.status === 'due-today' ? 'secondary' : 
                                  dueDateInfo.status === 'new' ? 'default' : 'outline'}
                          className="ml-2"
                        >
                          {dueDateInfo.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium mb-2">Question:</h4>
                          <p className="text-sm text-muted-foreground">{card.front}</p>
                        </div>
                        
                        {showAnswers[card.id] && (
                          <div className="border-t pt-3">
                            <h4 className="font-medium mb-2">Answer:</h4>
                            <p className="text-sm text-muted-foreground">{card.back}</p>
                          </div>
                        )}
                        
                        <div className="text-xs text-muted-foreground pt-2 border-t">
                          Click to {showAnswers[card.id] ? 'hide' : 'reveal'} answer
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {cardsToStudy.length > 6 && (
              <div className="text-center pt-6">
                <p className="text-muted-foreground mb-4">
                  ...and {cardsToStudy.length - 6} more cards waiting for review
                </p>
                <Button onClick={handleStartStudy} variant="outline">
                  Study All {cardsToStudy.length} Cards
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
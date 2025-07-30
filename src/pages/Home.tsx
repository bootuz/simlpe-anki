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
                Manage Decks
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
          /* New User Experience */
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">Welcome to Simple Anki!</h2>
              <p className="text-muted-foreground mb-8">
                Start your learning journey by creating your first deck of flashcards. 
                Organize your study materials into folders and decks, then use our 
                spaced repetition system to maximize your learning efficiency.
              </p>
              <Button onClick={handleManageDecks} size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Deck
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
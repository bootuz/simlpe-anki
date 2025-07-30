import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, BarChart3, LogOut, Clock, Calendar, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

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
  const [cards, setCards] = useState<CardWithDue[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({});

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Fetch cards data
  useEffect(() => {
    const fetchCards = async () => {
      if (!user) return;
      
      try {
        setCardsLoading(true);
        const { data, error } = await supabase
          .from('cards_with_details')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching cards:', error);
          return;
        }

        const transformedCards: CardWithDue[] = (data || []).map(card => ({
          id: card.id,
          front: card.front,
          back: card.back,
          deck_id: card.deck_id,
          deck_name: card.deck_name || 'Unknown Deck',
          folder_name: card.folder_name || 'Unknown Folder',
          due_date: card.due_date,
          created_at: card.created_at
        }));

        setCards(transformedCards);
      } catch (error) {
        console.error('Error fetching cards:', error);
      } finally {
        setCardsLoading(false);
      }
    };

    fetchCards();
  }, [user]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('cards_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cards' }, () => {
        // Refetch cards when there are changes
        const fetchCards = async () => {
          const { data, error } = await supabase
            .from('cards_with_details')
            .select('*')
            .eq('user_id', user.id);

          if (!error && data) {
            const transformedCards: CardWithDue[] = data.map(card => ({
              id: card.id,
              front: card.front,
              back: card.back,
              deck_id: card.deck_id,
              deck_name: card.deck_name || 'Unknown Deck',
              folder_name: card.folder_name || 'Unknown Folder',
              due_date: card.due_date,
              created_at: card.created_at
            }));
            setCards(transformedCards);
          }
        };
        fetchCards();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const totalCards = cards.length;

  const getDueDateStatus = (dueDate: string | null) => {
    // Handle null due_date for new cards
    if (!dueDate) {
      return { status: 'new', daysUntilDue: 0, label: 'New' };
    }

    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'overdue', daysUntilDue: Math.abs(diffDays), label: `${Math.abs(diffDays)} days overdue` };
    } else if (diffDays === 0) {
      return { status: 'due-today', daysUntilDue: 0, label: 'Due today' };
    } else if (diffDays <= 3) {
      return { status: 'due-soon', daysUntilDue: diffDays, label: `Due in ${diffDays} days` };
    } else {
      return { status: 'future', daysUntilDue: diffDays, label: `Due in ${diffDays} days` };
    }
  };

  const getCardStats = () => {
    const stats = {
      overdue: 0,
      dueToday: 0,
      dueSoon: 0,
      total: totalCards
    };

    cards.forEach(card => {
      const { status } = getDueDateStatus(card.due_date);
      if (status === 'overdue') stats.overdue++;
      else if (status === 'due-today') stats.dueToday++;
      else if (status === 'due-soon') stats.dueSoon++;
    });

    return stats;
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

  const stats = getCardStats();
  
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
              <h1 className="text-2xl font-bold">FlashCards</h1>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <Clock className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <p className="text-xs text-muted-foreground">Cards past due date</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-orange-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Due Today</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.dueToday}</div>
              <p className="text-xs text-muted-foreground">Cards due today</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.dueSoon}</div>
              <p className="text-xs text-muted-foreground">Due within 3 days</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
              <BookOpen className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.total}</div>
              <p className="text-xs text-muted-foreground">In your collection</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        {totalCards === 0 ? (
          /* New User Experience */
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">Welcome to FlashCards!</h2>
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

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
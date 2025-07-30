import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, LogOut, Calendar, FolderOpen, PlayCircle, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CardWithDue {
  id: string;
  front: string;
  back: string;
  deck_id: string;
  deck_name: string;
  folder_name: string;
  due_date: string;
  created_at: string;
}

const Home = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [cards, setCards] = useState<CardWithDue[]>([]);
  const [totalCards, setTotalCards] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Load all cards with due dates when user is authenticated
  useEffect(() => {
    if (user) {
      loadAllCards();
    }
  }, [user]);

  // Set up real-time subscription for card updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('card-fsrs-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'card_fsrs',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Reload cards when FSRS data is updated
          loadAllCards();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadAllCards = async () => {
    try {
      setDataLoading(true);
      
      // Get total card count (without FSRS join to count all cards)
      const { count: totalCardCount, error: countError } = await supabase
        .from("cards")
        .select("*", { count: 'exact', head: true });

      if (countError) throw countError;
      setTotalCards(totalCardCount || 0);
      
      // Join cards with card_fsrs, decks, and folders to get all info
      const { data, error } = await supabase
        .from("cards")
        .select(`
          id,
          front,
          back,
          deck_id,
          created_at,
          card_fsrs!inner (
            due_date
          ),
          decks!inner (
            name,
            folders!inner (
              name
            )
          )
        `)
        .order("card_fsrs(due_date)", { ascending: true });

      if (error) throw error;

      // Transform the data to flatten the structure
      const transformedCards: CardWithDue[] = data.map(card => ({
        id: card.id,
        front: card.front,
        back: card.back,
        deck_id: card.deck_id,
        deck_name: card.decks.name,
        folder_name: card.decks.folders.name,
        due_date: card.card_fsrs.due_date,
        created_at: card.created_at
      }));

      setCards(transformedCards);
    } catch (error) {
      console.error("Error loading cards:", error);
      toast({
        title: "Error",
        description: "Failed to load your cards",
        variant: "destructive"
      });
    } finally {
      setDataLoading(false);
    }
  };

  const getDueDateStatus = (dueDate: string | null) => {
    // Handle null due_date for new cards
    if (!dueDate) {
      return { isOverdue: false, daysUntilDue: Infinity, isDueToday: false, isNew: true };
    }
    
    const due = new Date(dueDate);
    const now = new Date();
    
    // For overdue check, use full datetime comparison
    const isOverdue = due < now;
    
    // For "due today" check, compare only dates
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const isDueToday = dueDay.getTime() === today.getTime();
    
    // Days until due calculation using start of day
    const daysUntilDue = Math.ceil((dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return { isOverdue, daysUntilDue, isDueToday, isNew: false };
  };

  // Calculate summary statistics
  const getCardStats = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const overdue = cards.filter(card => {
      const { isOverdue } = getDueDateStatus(card.due_date);
      return isOverdue;
    }).length;
    
    const dueToday = cards.filter(card => {
      const { isDueToday } = getDueDateStatus(card.due_date);
      return isDueToday;
    }).length;
    
    const dueSoon = cards.filter(card => {
      const { isOverdue, daysUntilDue, isDueToday } = getDueDateStatus(card.due_date);
      return !isOverdue && !isDueToday && daysUntilDue > 0 && daysUntilDue <= 3;
    }).length;
    
    return { overdue, dueToday, dueSoon, total: cards.length };
  };

  const stats = getCardStats();

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none"></div>
      <div className="relative z-10">
      {/* Header */}
      <header className="h-16 border-b bg-card/80 backdrop-blur-md supports-[backdrop-filter]:bg-card/60 shadow-sm w-full">
        <div className="flex items-center justify-between h-full px-6 w-full">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">Simple Anki</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/manage")}
              className="flex items-center gap-2"
            >
              <FolderOpen className="h-4 w-4" />
              Manage Decks
            </Button>
            
            {user && (
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 w-full">
        <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {(() => {
              const cardsToStudy = cards.filter(card => {
                const { isOverdue, daysUntilDue } = getDueDateStatus(card.due_date);
                const isDueToday = daysUntilDue === 0 && !isOverdue;
                return isOverdue || isDueToday;
              });
              return cardsToStudy.length > 0 ? "Cards Due for Review" : "No cards to review right now";
            })()}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Stay on top of your learning with spaced repetition flashcards
          </p>
        </div>

        {/* Summary Statistics */}
        {cards.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-destructive/10 mx-auto mb-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </div>
                <div className="text-2xl font-bold text-destructive">{stats.overdue}</div>
                <div className="text-xs text-muted-foreground">Overdue</div>
              </div>
              
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 mx-auto mb-2">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary">{stats.dueToday}</div>
                <div className="text-xs text-muted-foreground">Due Today</div>
              </div>
              
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 mx-auto mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary">{stats.dueSoon}</div>
                <div className="text-xs text-muted-foreground">Due Soon</div>
              </div>
              
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/10 mx-auto mb-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total Cards</div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              {stats.overdue > 0 && (
                <Button 
                  size="lg" 
                  className="shadow-lg"
                  onClick={() => navigate("/study")}
                >
                  <PlayCircle className="h-5 w-5 mr-2" />
                  Study Overdue ({stats.overdue})
                </Button>
              )}
              {stats.dueToday > 0 && (
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate("/study")}
                >
                  <Clock className="h-5 w-5 mr-2" />
                  Study Today ({stats.dueToday})
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Filter cards to show only overdue, due today, and new cards */}
        {(() => {
          const cardsToStudy = cards.filter(card => {
            const { isOverdue, isDueToday, isNew } = getDueDateStatus(card.due_date);
            return isOverdue || isDueToday || isNew;
          });

          if (cardsToStudy.length === 0) {
            // Empty state handling
            if (totalCards === 0) {
              // No cards at all - new user onboarding
              return (
                <div className="text-center py-16 space-y-8">
                  <div className="space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                      <BookOpen className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold">Welcome to Simple Anki!</h3>
                    <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                      Get started by creating your first deck of flashcards. Organize your learning with spaced repetition.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button size="lg" onClick={() => navigate("/manage")} className="shadow-lg">
                        <FolderOpen className="h-5 w-5 mr-2" />
                        Create Your First Deck
                      </Button>
                      <Button variant="outline" size="lg" onClick={() => navigate("/study")}>
                        <PlayCircle className="h-5 w-5 mr-2" />
                        Learn How to Study
                      </Button>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <p>💡 Tip: Start with a small deck of 10-20 cards for your first topic</p>
                    </div>
                  </div>
                </div>
              );
            } else {
              // Has cards but none are due for review
              const nextDueCard = cards
                .filter(card => card.due_date)
                .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())[0];
              
              return (
                <div className="text-center py-16 space-y-8">
                  <div className="space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-4">
                      <Calendar className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold">You're all caught up! 🎉</h3>
                    <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                      Great job! All your cards are scheduled for future review. Your next cards will be ready soon.
                    </p>
                  </div>
                  
                  {nextDueCard && (
                    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6 max-w-md mx-auto">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Clock className="h-4 w-4" />
                        <span>Next review:</span>
                      </div>
                      <div className="text-lg font-semibold">
                        {new Date(nextDueCard.due_date).toLocaleString('en-US', { 
                          weekday: 'long',
                          month: 'short', 
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {nextDueCard.deck_name} deck
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button variant="outline" size="lg" onClick={() => navigate("/manage")}>
                        <FolderOpen className="h-5 w-5 mr-2" />
                        Add More Cards
                      </Button>
                      <Button variant="outline" size="lg" onClick={() => navigate("/study")}>
                        <PlayCircle className="h-5 w-5 mr-2" />
                        Review All Cards
                      </Button>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <p>💪 Keep up the great work with your learning routine!</p>
                    </div>
                  </div>
                </div>
              );
            }
          }

          return (
            <div className="w-full space-y-6">
              <div className="space-y-6">
                {cardsToStudy.map((card, index) => {
                const { isOverdue, isDueToday, daysUntilDue } = getDueDateStatus(card.due_date);
                
                return (
                  <div 
                    key={card.id} 
                    className={`group relative bg-card backdrop-blur-sm border border-border/50 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 animate-fade-in ${
                      (() => {
                        const { isNew } = getDueDateStatus(card.due_date);
                        if (isNew) return 'ring-2 ring-green-500/20 bg-green-500/5 border-green-500/30';
                        if (isOverdue) return 'ring-2 ring-destructive/20 bg-destructive/5 border-destructive/30';
                        if (isDueToday) return 'ring-2 ring-primary/20 bg-primary/5 border-primary/30';
                        return '';
                      })()
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between p-6">
                      {/* Main Content */}
                      <div className="flex-1 min-w-0 space-y-3">
                        {/* Metadata */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                            <FolderOpen className="h-3 w-3" />
                            <span className="truncate font-medium">{card.folder_name}</span>
                            <span className="text-muted-foreground/60">/</span>
                            <BookOpen className="h-3 w-3" />
                            <span className="truncate font-medium">{card.deck_name}</span>
                          </div>
                          
                          {/* Due Date Badge */}
                          <div className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                            (() => {
                              const { isNew } = getDueDateStatus(card.due_date);
                              if (isNew) return 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30';
                              if (isOverdue) return 'bg-destructive/15 text-destructive border border-destructive/30';
                              return 'bg-primary/15 text-primary border border-primary/30';
                            })()
                          }`}>
                            {(() => {
                              const { isNew } = getDueDateStatus(card.due_date);
                              if (isNew) return 'New';
                              if (isOverdue) return 'Overdue';
                              if (daysUntilDue === 0) return 'Due today';
                              return `Due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`;
                            })()}
                          </div>
                        </div>
                        
                         {/* Card Content */}
                         <div className="space-y-2">
                           <h3 className="text-lg font-semibold text-foreground leading-tight">
                             {card.front}
                           </h3>
                            <div 
                              className="text-muted-foreground leading-relaxed cursor-pointer select-none transition-all duration-200 filter blur-sm"
                              title="Click to reveal answer"
                             tabIndex={0}
                             onKeyDown={(e) => {
                               if (e.key === 'Enter' || e.key === ' ') {
                                 e.preventDefault();
                                 e.currentTarget.classList.toggle('blur-sm');
                               }
                             }}
                             onClick={(e) => {
                               e.currentTarget.classList.toggle('blur-sm');
                             }}
                           >
                             {card.back}
                           </div>
                         </div>
                      </div>

                      {/* Action Area */}
                      <div className="flex flex-col items-end gap-3 ml-4">
                        <Button 
                          size="sm" 
                          variant={isOverdue ? "default" : "outline"}
                          className="shrink-0"
                          onClick={() => navigate(`/study?cardId=${card.id}`)}
                        >
                          <PlayCircle className="h-4 w-4 mr-1" />
                          Study
                        </Button>
                        
                        {card.due_date && (
                          <div className="text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded">
                            {new Date(card.due_date).toLocaleString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: new Date(card.due_date).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          );
        })()}
        </div>
      </main>
      </div>
    </div>
  );
};

export default Home;
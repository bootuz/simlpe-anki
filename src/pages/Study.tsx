import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, LogOut, RotateCcw, Eye, EyeOff, CheckCircle, XCircle, Home, ArrowLeft, AlertTriangle, Check, Clock, Repeat } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { fsrsService, Rating } from "@/services/fsrsService";
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from "@/hooks/useOptimizedQueries";

interface StudyCard {
  id: string;
  front: string;
  back: string;
  deck_id: string;
  deck_name: string;
  folder_name: string;
  due_date: string | null;
  created_at: string;
  state?: string;
}

const Study = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [cards, setCards] = useState<StudyCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [studyComplete, setStudyComplete] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Load cards due for study
  useEffect(() => {
    if (user) {
      loadStudyCards();
    }
  }, [user]);

  const currentCard = cards[currentCardIndex];

  // Helper function to get card status for display
  const getCardStatus = (card: StudyCard) => {
    if (!card.due_date) {
      return { label: 'New', variant: 'default' as const, icon: <BookOpen className="h-3 w-3" /> };
    }
    
    const now = new Date();
    const dueDate = new Date(card.due_date);
    
    if (card.state === 'Learning') {
      return { label: 'Learning', variant: 'secondary' as const, icon: <Repeat className="h-3 w-3" /> };
    }
    
    if (card.state === 'Relearning') {
      return { label: 'Relearning', variant: 'destructive' as const, icon: <Repeat className="h-3 w-3" /> };
    }
    
    if (dueDate <= now) {
      const hoursOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60));
      if (hoursOverdue > 24) {
        return { label: `${Math.floor(hoursOverdue / 24)}d overdue`, variant: 'destructive' as const, icon: <AlertTriangle className="h-3 w-3" /> };
      } else if (hoursOverdue > 0) {
        return { label: `${hoursOverdue}h overdue`, variant: 'destructive' as const, icon: <Clock className="h-3 w-3" /> };
      } else {
        return { label: 'Due now', variant: 'secondary' as const, icon: <Clock className="h-3 w-3" /> };
      }
    }
    
    return { label: 'Review', variant: 'outline' as const, icon: <BookOpen className="h-3 w-3" /> };
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle keyboard shortcuts when there's a current card
      if (!currentCard) return;
      
      // Show answer with spacebar
      if (event.code === 'Space' && !showAnswer) {
        event.preventDefault();
        setShowAnswer(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentCard, showAnswer]);

  const loadStudyCards = async () => {
    try {
      setDataLoading(true);
      
      const specificCardId = searchParams.get('cardId');
      let transformedCards: StudyCard[] = [];
      
      if (specificCardId) {
        // Load only the specific card
        const { data, error } = await supabase
          .from("cards_with_details")
          .select("*")
          .eq('id', specificCardId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          toast({
            title: "Card not found",
            description: "The specified card could not be found.",
            variant: "destructive"
          });
          return;
        }

        const transformedCard: StudyCard = {
          id: data.id,
          front: data.front,
          back: data.back,
          deck_id: data.deck_id,
          deck_name: data.deck_name || 'Uncategorized Deck',
          folder_name: data.folder_name || 'Personal',
          due_date: data.due_date,
          created_at: data.created_at,
          state: data.state || 'New'
        };

        transformedCards = [transformedCard];
      } else {
        // Load all cards due for review (overdue or due today)
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today
        
        const { data, error } = await supabase
          .from("study_cards")
          .select("*")
          .eq("user_id", user.id);

        if (error) throw error;

        // Transform the data
        transformedCards = (data || []).map(card => ({
          id: card.id,
          front: card.front,
          back: card.back,
          deck_id: card.deck_id,
          deck_name: card.deck_name || 'Uncategorized Deck',
          folder_name: card.folder_name || 'Personal',
          due_date: card.due_date,
          created_at: card.created_at,
          state: card.state || 'New'
        }));
      }
      
      setCards(transformedCards);
      
      if (transformedCards.length === 0) {
        setStudyComplete(true);
      } else {
        setStudyComplete(false);
        setCurrentCardIndex(0);
        setShowAnswer(false);
      }
    } catch (error) {
      console.error("Error loading study cards:", error);
      toast({
        title: "Error",
        description: "Failed to load study cards",
        variant: "destructive"
      });
    } finally {
      setDataLoading(false);
    }
  };

  const handleAnswer = async (difficulty: 'easy' | 'medium' | 'hard' | 'again') => {
    try {
      const cardId = currentCard.id;
      
      // Map our difficulty to FSRS Rating
      const ratingMap = {
        'again': Rating.Again,
        'hard': Rating.Hard, 
        'medium': Rating.Good,
        'easy': Rating.Easy
      };
      
      const rating = ratingMap[difficulty];
      
      // Use FSRS service to process the review
      const result = await fsrsService.processReview(cardId, rating, user.id);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to process review');
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.cardsWithDetails(user.id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.studyCards(user.id) 
      });
      
      // Move to next card or complete study session
      const nextIndex = currentCardIndex + 1;
      if (nextIndex >= cards.length) {
        setStudyComplete(true);
      } else {
        setCurrentCardIndex(nextIndex);
        setShowAnswer(false);
      }
      
      // Show success message with review timing
      toast({
        title: "Progress saved",
        description: `Card reviewed. Next review in ${result.nextReviewIn}. ${cards.length - nextIndex} cards remaining.`,
      });
      
    } catch (error) {
      console.error("Error updating card:", error);
      toast({
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to save your progress. Please try again.",
        variant: "destructive"
      });
    }
  };

  const progress = cards.length > 0 ? (currentCardIndex / cards.length) * 100 : 0;

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4 mx-auto"></div>
          <p className="text-muted-foreground">Loading study session...</p>
        </div>
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
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
              <div className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold">Simple Anki - Study</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
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
        <main className="py-8 w-full">
          <div className="max-w-2xl mx-auto px-6">
            
            {studyComplete ? (
              // Study Complete Screen
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl font-bold">Study Complete!</h2>
                <p className="text-lg text-muted-foreground">
                  Great job! You've reviewed all your due cards.
                </p>
                <div className="flex justify-center gap-4">
                  <Button onClick={() => navigate("/")} size="lg">
                    <Home className="h-5 w-5 mr-2" />
                    Back to Home
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/manage")} size="lg">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Manage Decks
                  </Button>
                </div>
              </div>
            ) : currentCard ? (
              // Study Interface
              <div className="space-y-6">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Progress</span>
                    <span>{currentCardIndex + 1} of {cards.length}</span>
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-2">
                    <div 
                      className="bg-primary rounded-full h-2 transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Card Metadata */}
                <div className="flex items-center justify-center gap-3">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-md">
                    <BookOpen className="h-4 w-4" />
                    <span>{currentCard.folder_name} / {currentCard.deck_name}</span>
                  </div>
                  {(() => {
                    const status = getCardStatus(currentCard);
                    return (
                      <Badge variant={status.variant} className="text-xs">
                        {status.icon}
                        <span className="ml-1">{status.label}</span>
                      </Badge>
                    );
                  })()}
                </div>

                {/* Study Card */}
                <Card className="min-h-[400px] bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="px-8 pt-8 pb-4 flex flex-col justify-center items-center text-center h-full min-h-[400px]">
                    <div className="space-y-6 w-full">
                      {/* Question */}
                      <div className="space-y-4">
                        <h3 className="text-2xl font-bold leading-tight">
                          {currentCard.front}
                        </h3>
                      </div>

                      {/* Answer */}
                      {showAnswer && (
                        <div className="border-t pt-6 space-y-4 animate-fade-in">
                          <p className="text-lg text-muted-foreground leading-relaxed">
                            {currentCard.back}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="pt-6">
                        {!showAnswer ? (
                          <div className="space-y-2">
                            <Button 
                              onClick={() => setShowAnswer(true)}
                              size="lg"
                              className="w-full max-w-xs"
                            >
                              <Eye className="h-5 w-5 mr-2" />
                              Show Answer
                            </Button>
                            <p className="text-xs text-muted-foreground">Press spacebar to reveal</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">How well did you know this?</p>
                            <div className="grid grid-cols-4 gap-2">
                               <Button 
                                 onClick={() => handleAnswer('again')}
                                 variant="outline"
                                 size="lg"
                                 className="border-red-300 text-red-700 hover:bg-red-100 hover:text-red-800 hover:border-red-400 py-3"
                               >
                                 <XCircle className="h-4 w-4 mr-1" />
                                 Again
                               </Button>
                               <Button 
                                 onClick={() => handleAnswer('hard')}
                                 variant="outline"
                                 size="lg"
                                 className="border-orange-300 text-orange-700 hover:bg-orange-100 hover:text-orange-800 hover:border-orange-400 py-3"
                               >
                                 <AlertTriangle className="h-4 w-4 mr-1" />
                                 Hard
                               </Button>
                               <Button 
                                 onClick={() => handleAnswer('medium')}
                                 variant="outline"
                                 size="lg"
                                 className="border-blue-300 text-blue-700 hover:bg-blue-100 hover:text-blue-800 hover:border-blue-400 py-3"
                               >
                                 <Check className="h-4 w-4 mr-1" />
                                 Good
                               </Button>
                               <Button 
                                 onClick={() => handleAnswer('easy')}
                                 variant="outline"
                                 size="lg"
                                 className="border-green-300 text-green-700 hover:bg-green-100 hover:text-green-800 hover:border-green-400 py-3"
                               >
                                 <CheckCircle className="h-4 w-4 mr-1" />
                                 Easy
                               </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              // No Cards to Study
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/10 mb-4">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-3xl font-bold">No Cards to Study</h2>
                <p className="text-lg text-muted-foreground">
                  You're all caught up! Check back later or create some new cards.
                </p>
                <div className="flex justify-center gap-4">
                  <Button onClick={() => navigate("/")} size="lg">
                    <Home className="h-5 w-5 mr-2" />
                    Back to Home
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/manage")} size="lg">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Manage Decks
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Study;
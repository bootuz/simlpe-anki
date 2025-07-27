import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, LogOut, RotateCcw, Eye, EyeOff, CheckCircle, XCircle, Home, ArrowLeft, AlertTriangle, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StudyCard {
  id: string;
  front: string;
  back: string;
  deck_id: string;
  deck_name: string;
  folder_name: string;
  due_date: string;
  created_at: string;
}

const Study = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
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

  const loadStudyCards = async () => {
    try {
      setDataLoading(true);
      
      const specificCardId = searchParams.get('cardId');
      let transformedCards: StudyCard[] = [];
      
      if (specificCardId) {
        // Load only the specific card
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
          .eq('id', specificCardId)
          .single();

        if (error) throw error;

        const transformedCard: StudyCard = {
          id: data.id,
          front: data.front,
          back: data.back,
          deck_id: data.deck_id,
          deck_name: data.decks.name,
          folder_name: data.decks.folders.name,
          due_date: data.card_fsrs.due_date,
          created_at: data.created_at
        };

        transformedCards = [transformedCard];
      } else {
        // Load all cards due for review (overdue or due today)
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today
        
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
          .lte("card_fsrs.due_date", today.toISOString())
          .order("card_fsrs(due_date)", { ascending: true });

        if (error) throw error;

        // Transform the data
        transformedCards = data.map(card => ({
          id: card.id,
          front: card.front,
          back: card.back,
          deck_id: card.deck_id,
          deck_name: card.decks.name,
          folder_name: card.decks.folders.name,
          due_date: card.card_fsrs.due_date,
          created_at: card.created_at
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
      
      // Get current FSRS data for the card
      const { data: fsrsData, error: fsrsError } = await supabase
        .from('card_fsrs')
        .select('*')
        .eq('card_id', cardId)
        .single();
      
      if (fsrsError) throw fsrsError;
      
      // Calculate new FSRS values based on the FSRS algorithm
      const now = new Date();
      const lastReview = fsrsData.last_review ? new Date(fsrsData.last_review) : new Date(fsrsData.created_at);
      const elapsedDays = Math.max(1, Math.ceil((now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24)));
      
      let newState = fsrsData.state;
      let newReps = fsrsData.reps;
      let newLapses = fsrsData.lapses;
      let newDifficulty = fsrsData.difficulty;
      let newStability = fsrsData.stability;
      let newScheduledDays = fsrsData.scheduled_days;
      
      // FSRS algorithm implementation (simplified version)
      switch (difficulty) {
        case 'again':
          newState = 'Relearning';
          newLapses += 1;
          newScheduledDays = 1;
          newDifficulty = Math.min(10, newDifficulty + 0.2);
          newStability = Math.max(0.1, newStability * 0.8);
          break;
        case 'hard':
          newReps += 1;
          newState = newReps === 1 ? 'Learning' : 'Review';
          newScheduledDays = Math.max(1, Math.round(newStability * 1.2));
          newDifficulty = Math.min(10, newDifficulty + 0.15);
          newStability = newStability * 0.85;
          break;
        case 'medium':
          newReps += 1;
          newState = newReps === 1 ? 'Learning' : 'Review';
          newScheduledDays = Math.max(1, Math.round(newStability * 2.5));
          newDifficulty = Math.max(1, newDifficulty - 0.1);
          newStability = newStability * 1.3;
          break;
        case 'easy':
          newReps += 1;
          newState = 'Review';
          newScheduledDays = Math.max(1, Math.round(newStability * 4));
          newDifficulty = Math.max(1, newDifficulty - 0.2);
          newStability = newStability * 1.5;
          break;
      }
      
      // Calculate new due date
      const newDueDate = new Date(now);
      newDueDate.setDate(newDueDate.getDate() + newScheduledDays);
      
      // Update the FSRS data in the database
      const { error: updateError } = await supabase
        .from('card_fsrs')
        .update({
          state: newState,
          reps: newReps,
          lapses: newLapses,
          difficulty: newDifficulty,
          stability: newStability,
          scheduled_days: newScheduledDays,
          elapsed_days: elapsedDays,
          due_date: newDueDate.toISOString(),
          last_review: now.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('card_id', cardId);
      
      if (updateError) throw updateError;
      
      const nextIndex = currentCardIndex + 1;
      if (nextIndex >= cards.length) {
        setStudyComplete(true);
      } else {
        setCurrentCardIndex(nextIndex);
        setShowAnswer(false);
      }
      
      toast({
        title: "Progress saved",
        description: `Card reviewed. Next review in ${newScheduledDays} day${newScheduledDays === 1 ? '' : 's'}. ${cards.length - nextIndex} cards remaining.`,
      });
      
    } catch (error) {
      console.error("Error updating card:", error);
      toast({
        title: "Error",
        description: "Failed to save your progress. Please try again.",
        variant: "destructive"
      });
    }
  };

  const currentCard = cards[currentCardIndex];
  const progress = cards.length > 0 ? ((currentCardIndex + 1) / cards.length) * 100 : 0;

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
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
                <div className="flex items-center justify-center gap-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-md">
                    <BookOpen className="h-4 w-4" />
                    <span>{currentCard.folder_name} / {currentCard.deck_name}</span>
                  </div>
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
                          <Button 
                            onClick={() => setShowAnswer(true)}
                            size="lg"
                            className="w-full max-w-xs"
                          >
                            <Eye className="h-5 w-5 mr-2" />
                            Show Answer
                          </Button>
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
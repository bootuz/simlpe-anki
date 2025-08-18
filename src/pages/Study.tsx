import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BookOpen, LogOut, Eye, CheckCircle, XCircle, Home, ArrowLeft, AlertTriangle, Check, Clock, Repeat, Undo2, Timer, Target, TrendingUp, ChevronDown, ChevronUp, Sparkles, Brain, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getFSRSServiceForUser, Rating, type FSRSCard } from "@/services/fsrsService";
import { SchedulingPreview, ReviewHistory, SessionStatsDefault as SessionStats, SessionRecoveryDialog } from "@/components/study";
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from "@/hooks/useOptimizedQueries";
import { 
  hasActiveSession, 
  saveSession, 
  clearSession, 
  updateSessionActivity,
  type StoredSession 
} from "@/utils/sessionStorage";

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
  const [lastReviewedCardId, setLastReviewedCardId] = useState<string | null>(null);
  const [undoLoading, setUndoLoading] = useState(false);
  const [currentFSRSCard, setCurrentFSRSCard] = useState<FSRSCard | null>(null);
  const [fsrsCardLoading, setFsrsCardLoading] = useState(false);
  
  // Session tracking state
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [cardsStudied, setCardsStudied] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [showDetailedStats, setShowDetailedStats] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  // Session recovery state
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [recoverySession, setRecoverySession] = useState<StoredSession | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Check for existing session on mount
  useEffect(() => {
    if (user && !sessionChecked) {
      const existingSession = hasActiveSession(user.id);
      if (existingSession) {
        setRecoverySession(existingSession);
        setShowRecoveryDialog(true);
        setDataLoading(false); // Stop loading spinner when showing recovery dialog
      } else {
        // No existing session, proceed with loading cards
        void loadStudyCards();
      }
      setSessionChecked(true);
    }
  }, [user, sessionChecked]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load cards due for study (only when not showing recovery dialog)
  useEffect(() => {
    if (user && sessionChecked && !showRecoveryDialog && !recoverySession) {
      void loadStudyCards();
    }
  }, [user, sessionChecked, showRecoveryDialog, recoverySession]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentCard = cards[currentCardIndex];

  // Helper function to format duration
  const formatDuration = (startTime: Date): string => {
    const duration = currentTime - startTime.getTime();
    const minutes = Math.floor(duration / (1000 * 60));
    const seconds = Math.floor((duration % (1000 * 60)) / 1000);
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };

  // Load FSRS card data when current card changes
  useEffect(() => {
    if (currentCard && user) {
      void loadCurrentFSRSCard();
    }
  }, [currentCard, user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update timer every second for real-time session stats
  useEffect(() => {
    if (sessionStartTime && !studyComplete) {
      const interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [sessionStartTime, studyComplete]);

  // Session recovery handlers
  const handleContinueSession = () => {
    if (!recoverySession) return;
    
    // Restore session state
    setSessionStartTime(new Date(recoverySession.startTime));
    setCardsStudied(recoverySession.cardsStudied);
    setCorrectAnswers(recoverySession.correctAnswers);
    setIncorrectAnswers(recoverySession.incorrectAnswers);
    setCurrentCardIndex(recoverySession.currentCardIndex);
    
    // Update activity and load cards
    updateSessionActivity();
    setShowRecoveryDialog(false);
    setDataLoading(true); // Show loading while fetching cards
    void loadStudyCards();
  };

  const handleStartFresh = () => {
    // Clear the stored session and start fresh
    clearSession();
    setShowRecoveryDialog(false);
    setRecoverySession(null);
    setDataLoading(true); // Show loading while fetching cards
    void loadStudyCards();
  };

  // Note: Session saving is now handled directly in handleAnswer to avoid saving empty sessions

  const loadCurrentFSRSCard = async () => {
    if (!currentCard || !user) return;
    
    try {
      setFsrsCardLoading(true);
      
      // Get FSRS data for current card
      const { data: fsrsData, error } = await supabase
        .from('card_fsrs')
        .select('*')
        .eq('card_id', currentCard.id)
        .eq('user_id', user.id)
        .single();
      
      if (error || !fsrsData) {
        setCurrentFSRSCard(null);
        return;
      }
      
      // Convert to FSRS Card using the service
      const fsrsService = await getFSRSServiceForUser(user.id);
      const fsrsCard = fsrsService.dbRecordToFSRSCard(fsrsData);
      setCurrentFSRSCard(fsrsCard);
      
    } catch (error) {
      setCurrentFSRSCard(null);
    } finally {
      setFsrsCardLoading(false);
    }
  };

  // Helper function to get card status for display with positive messaging
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
      return { label: 'Relearning', variant: 'secondary' as const, icon: <Repeat className="h-3 w-3" /> };
    }
    
    if (dueDate <= now) {
      const hoursReady = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60));
      if (hoursReady > 24) {
        const daysReady = Math.floor(hoursReady / 24);
        return { label: `Ready for ${daysReady}d`, variant: 'secondary' as const, icon: <Target className="h-3 w-3" /> };
      } else if (hoursReady > 0) {
        return { label: `Ready for ${hoursReady}h`, variant: 'secondary' as const, icon: <Target className="h-3 w-3" /> };
      } else {
        return { label: 'Ready now', variant: 'secondary' as const, icon: <Target className="h-3 w-3" /> };
      }
    }
    
    return { label: 'Review', variant: 'outline' as const, icon: <BookOpen className="h-3 w-3" /> };
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle keyboard shortcuts when there's a current card
      if (!currentCard) return;
      
      // Show answer with space bar
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
          .from('cards_with_details')
          .select('*')
          .eq('id', specificCardId)
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
        // Load all cards ready for study (new or ready for review)
        const { data, error } = await supabase
          .from('cards_with_details')
          .select('*')
          .or('due_date.is.null,due_date.lte.' + new Date().toISOString());

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
        
        // Initialize session tracking
        const startTime = new Date();
        setSessionStartTime(startTime);
        setCardsStudied(0);
        setCorrectAnswers(0);
        setIncorrectAnswers(0);
        
        // Don't save session immediately - wait until user reviews first card
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load study cards",
        variant: "destructive"
      });
    } finally {
      setDataLoading(false);
    }
  };

  const handleAnswer = async (rating: Rating) => {
    if (!user?.id) {
      toast({
        title: "Session expired",
        description: "Please log in again to continue studying.",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    try {
      const cardId = currentCard.id;
      
      // Use user-specific FSRS service to process the review
      const fsrsService = await getFSRSServiceForUser(user.id);
      const result = await fsrsService.processReview(cardId, rating, user.id);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to process review');
      }

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.cardsWithDetails(user.id)
      });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.studyCards(user.id)
      });
      
      // Store the reviewed card ID for potential undo
      setLastReviewedCardId(cardId);

      // Update session tracking
      const newCardsStudied = cardsStudied + 1;
      setCardsStudied(newCardsStudied);
      if (rating === Rating.Again) {
        setIncorrectAnswers(prev => prev + 1);
      } else {
        setCorrectAnswers(prev => prev + 1);
      }

      // Move to next card or complete study session
      const nextIndex = currentCardIndex + 1;
      if (nextIndex >= cards.length) {
        setStudyComplete(true);
        // Clear session on completion
        clearSession();
      } else {
        setCurrentCardIndex(nextIndex);
        setShowAnswer(false);
        
        // Save session state (including first-time save)
        if (user && sessionStartTime) {
          saveSession({
            startTime: sessionStartTime.toISOString(),
            cardsStudied: newCardsStudied,
            correctAnswers: rating === Rating.Again ? correctAnswers : correctAnswers + 1,
            incorrectAnswers: rating === Rating.Again ? incorrectAnswers + 1 : incorrectAnswers,
            currentCardIndex: nextIndex,
            totalCards: cards.length,
            userId: user.id
          });
        }
      }
      
      // Show success message with positive feedback
      toast({
        title: "Great progress!",
        description: `Card learned! Next review in ${result.nextReviewIn}. ${cards.length - nextIndex} more cards to go.`,
      });
      
    } catch (error) {
      toast({
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to save your progress. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUndoLastReview = async () => {
    if (!user?.id) {
      toast({
        title: "Session expired",
        description: "Please log in again to continue studying.",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    if (!lastReviewedCardId) {
      toast({
        title: "No review to undo",
        description: "There's no recent review to undo.",
        variant: "destructive"
      });
      return;
    }

    try {
      setUndoLoading(true);
      
      const fsrsService = await getFSRSServiceForUser(user.id);
      const result = await fsrsService.undoLastReview(lastReviewedCardId, user.id);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to undo review');
      }

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.cardsWithDetails(user.id)
      });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.studyCards(user.id)
      });

      // Move back to the previous card
      const prevIndex = Math.max(0, currentCardIndex - 1);
      setCurrentCardIndex(prevIndex);
      setShowAnswer(false);
      setLastReviewedCardId(null);

      toast({
        title: "Review undone",
        description: "The last review has been successfully undone.",
      });

    } catch (error) {
      toast({
        title: "Undo failed",
        description: error instanceof Error ? error.message : "Failed to undo the review. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUndoLoading(false);
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
              {lastReviewedCardId && currentCardIndex > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={undoLoading}
                      className="flex items-center gap-2"
                    >
                      <Undo2 className="h-4 w-4" />
                      {undoLoading ? 'Undoing...' : 'Undo Last Review'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Undo Last Review?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will restore the previous card state and remove the last review from your history. 
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleUndoLastReview}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Undo Review
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
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
              // Study Complete Screen - Redesigned
              <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-20 left-20 w-24 h-24 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-xl animate-pulse" />
                  <div className="absolute bottom-32 right-24 w-32 h-32 bg-gradient-to-br from-accent/30 to-primary/30 rounded-full blur-xl animate-pulse delay-700" />
                  <div className="absolute top-1/2 left-10 w-16 h-16 bg-gradient-to-br from-primary/40 to-transparent rounded-full blur-lg animate-pulse delay-300" />
                  <div className="absolute bottom-20 left-1/3 w-20 h-20 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-xl animate-pulse delay-1000" />
                </div>

                <section className="relative text-center animate-fade-in max-w-2xl mx-auto px-6">
                  {/* Achievement Animation */}
                  <div className="relative mb-12">
                    <div className="relative mx-auto w-40 h-40 mb-8">
                      {/* Multiple rotating rings */}
                      <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-spin" style={{ animationDuration: '8s' }} />
                      <div className="absolute inset-3 rounded-full border border-accent/40 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />
                      <div className="absolute inset-6 rounded-full border border-primary/20 animate-spin" style={{ animationDuration: '10s' }} />
                      
                      {/* Central achievement icon */}
                      <div className="absolute inset-8 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-2xl">
                          <CheckCircle className="h-12 w-12 text-white drop-shadow-lg" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Floating celebration elements - positioned outside the main circle */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 translate-x-8 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 -translate-x-12 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-bounce delay-500 shadow-lg">
                      <Target className="h-3 w-3 text-white" />
                    </div>
                    <div className="absolute top-6 -left-16 w-5 h-5 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full animate-pulse shadow-md" />
                    <div className="absolute top-2 -right-14 w-4 h-4 bg-gradient-to-br from-pink-400 to-red-500 rounded-full animate-pulse delay-700 shadow-md" />
                    <div className="absolute bottom-12 -right-12 w-3 h-3 bg-gradient-to-br from-indigo-400 to-cyan-500 rounded-full animate-pulse delay-1000" />
                    <div className="absolute bottom-4 -left-12 w-4 h-4 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full animate-pulse delay-300" />
                  </div>

                  {/* Success Message */}
                  <div className="space-y-8 mb-12">
                    <h2 className="text-5xl md:text-6xl font-bold leading-tight">
                      <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                        Outstanding!
                      </span>
                    </h2>
                    <div className="space-y-4">
                      <h3 className="text-2xl md:text-3xl font-semibold text-foreground">Study Session Complete</h3>
                      <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg mx-auto">
                        Amazing work! You've successfully completed all your ready cards.
                        <span className="block mt-2 text-primary font-semibold">Your learning journey continues! 🚀</span>
                      </p>
                    </div>
                  </div>

                  {/* Session Stats Summary */}
                  {sessionStartTime && (
                    <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 rounded-2xl p-8 mb-10 border border-primary/10 backdrop-blur-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                            <Timer className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="text-2xl font-bold text-blue-600">{formatDuration(sessionStartTime)}</div>
                          <div className="text-sm text-muted-foreground">Study Time</div>
                        </div>
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center">
                            <Target className="h-6 w-6 text-green-600" />
                          </div>
                          <div className="text-2xl font-bold text-green-600">{cardsStudied}</div>
                          <div className="text-sm text-muted-foreground">Cards Mastered</div>
                        </div>
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-purple-600" />
                          </div>
                          <div className="text-2xl font-bold text-purple-600">
                            {cardsStudied > 0 ? Math.round((correctAnswers / cardsStudied) * 100) : 0}%
                          </div>
                          <div className="text-sm text-muted-foreground">Accuracy</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Achievement Badge */}
                  <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 rounded-2xl p-6 mb-10 border border-primary/20">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                        <Brain className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-xl font-bold text-primary">Knowledge Level Up!</span>
                    </div>
                    <p className="text-muted-foreground">
                      Your consistent study efforts are building stronger neural pathways and better retention
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <Button 
                        onClick={() => navigate("/")} 
                        size="lg"
                        className="group relative px-8 py-6 text-lg font-semibold bg-gradient-to-r from-primary via-primary to-accent hover:from-accent hover:via-primary hover:to-primary transition-all duration-500 shadow-xl hover:shadow-primary/30 transform hover:scale-105"
                      >
                        <span className="relative z-10 flex items-center gap-3">
                          <Home className="h-5 w-5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                          Continue Learning
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </span>
                        <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/20 to-accent/20 blur-xl group-hover:blur-2xl transition-all duration-300" />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => navigate("/manage")} 
                        size="lg"
                        className="px-8 py-6 text-lg font-semibold border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
                      >
                        <BookOpen className="h-5 w-5 mr-2" />
                        Manage Cards
                      </Button>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Great job today! Come back tomorrow to review and learn new cards
                    </p>
                  </div>
                </section>
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

                {/* Compact Session Stats */}
                {sessionStartTime && (
                  <div className="flex items-center justify-center gap-6 py-4 px-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl text-sm shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/30">
                        <Timer className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Duration</span>
                        <span className="font-semibold">
                          {formatDuration(sessionStartTime)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950/30">
                        <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Progress</span>
                        <span className="font-semibold">
                          {cardsStudied} / {cards.length}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-950/30">
                        <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Accuracy</span>
                        <span className="font-semibold">
                          {cardsStudied > 0 ? Math.round((correctAnswers / cardsStudied) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

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
                          currentFSRSCard ? (
                            <SchedulingPreview 
                              card={currentFSRSCard}
                              userId={user.id}
                              onRatingSelect={handleAnswer}
                              disabled={fsrsCardLoading}
                            />
                          ) : (
                            <div className="space-y-4">
                              <p className="text-sm text-muted-foreground">How well did you know this?</p>
                              <div className="grid grid-cols-4 gap-2">
                                <Button 
                                  onClick={() => handleAnswer(Rating.Again)}
                                  variant="soft-destructive"
                                  size="lg"
                                  disabled={fsrsCardLoading}
                                  className="py-3 hover:scale-105 transition-all duration-200"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Again
                                </Button>
                                <Button 
                                  onClick={() => handleAnswer(Rating.Hard)}
                                  variant="warning"
                                  size="lg"
                                  disabled={fsrsCardLoading}
                                  className="py-3 hover:scale-105 transition-all duration-200"
                                >
                                  <AlertTriangle className="h-4 w-4 mr-1" />
                                  Hard
                                </Button>
                                <Button 
                                  onClick={() => handleAnswer(Rating.Good)}
                                  variant="soft-success"
                                  size="lg"
                                  disabled={fsrsCardLoading}
                                  className="py-3 hover:scale-105 transition-all duration-200"
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Good
                                </Button>
                                <Button 
                                  onClick={() => handleAnswer(Rating.Easy)}
                                  variant="success"
                                  size="lg"
                                  disabled={fsrsCardLoading}
                                  className="py-3 hover:scale-105 transition-all duration-200"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                   Easy
                                 </Button>
                               </div>
                             </div>
                           )
                         )}
                       </div>
                     </div>
                   </CardContent>
                 </Card>

                 {/* Detailed Session Stats Toggle */}
                 {sessionStartTime && (
                   <div className="space-y-4">
                     <Button
                       variant="outline"
                       onClick={() => setShowDetailedStats(!showDetailedStats)}
                       className="w-full flex items-center justify-center gap-2"
                     >
                       {showDetailedStats ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                       {showDetailedStats ? 'Hide Detailed Stats' : 'Show Detailed Stats'}
                     </Button>

                     {showDetailedStats && (
                       <div className="animate-fade-in">
                         <SessionStats
                           sessionStats={{
                             totalCards: cards.length,
                             cardsStudied: cardsStudied,
                             cardsRemaining: cards.length - cardsStudied,
                             correctAnswers: correctAnswers,
                             incorrectAnswers: incorrectAnswers,
                             sessionStartTime: sessionStartTime,
                             sessionDuration: undefined, // Will be calculated in component
                             averageResponseTime: undefined
                           }}
                           isSessionComplete={false}
                           showDetailed={true}
                         />
                       </div>
                     )}
                   </div>
                 )}

                 {/* Review History */}
                 <div className="mt-8">
                   <ReviewHistory 
                     cardId={currentCard.id} 
                     userId={user.id} 
                   />
                 </div>
              </div>
            ) : (
              // No Cards to Study
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/10 mb-4">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-3xl font-bold">All Caught Up!</h2>
                <p className="text-lg text-muted-foreground">
                  No cards are ready to study right now. Check back later or create some new cards!
                </p>
                <div className="flex justify-center gap-4">
                  <Button 
                    onClick={() => navigate("/")} 
                    size="lg"
                    className="group bg-gradient-to-r from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-2xl hover:shadow-primary/40 transform hover:scale-105 transition-all duration-300"
                  >
                    <Home className="h-5 w-5 mr-2 text-white" />
                    Back to Home
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/manage")} 
                    size="lg"
                    className="border-border hover:bg-muted transition-colors duration-200"
                  >
                    <BookOpen className="h-5 w-5 mr-2" />
                    Manage Decks
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Session Recovery Dialog */}
      {showRecoveryDialog && recoverySession && (
        <SessionRecoveryDialog
          isOpen={showRecoveryDialog}
          session={recoverySession}
          onContinue={handleContinueSession}
          onStartFresh={handleStartFresh}
        />
      )}
    </div>
  );
};

export default Study;
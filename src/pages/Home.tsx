import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, LogOut, Calendar, FolderOpen } from "lucide-react";
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

  const loadAllCards = async () => {
    try {
      setDataLoading(true);
      
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

  const getDueDateStatus = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const isOverdue = due <= now;
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return { isOverdue, daysUntilDue };
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none"></div>
      <div className="relative z-10">
      {/* Header */}
      <header className="h-16 border-b bg-card/80 backdrop-blur-md supports-[backdrop-filter]:bg-card/60 shadow-sm">
        <div className="flex items-center justify-between h-full px-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">FlashCards</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/study")}
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
        <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Cards Due for Review
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay on top of your learning with spaced repetition flashcards
          </p>
        </div>

        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl"></div>
              <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 text-center">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-2xl font-semibold mb-3">No cards to review</h3>
                <p className="text-muted-foreground text-center mb-8 max-w-md">
                  Create some flashcards to start your learning journey with spaced repetition
                </p>
                <Button onClick={() => navigate("/study")} size="lg" className="shadow-lg">
                  <FolderOpen className="h-5 w-5 mr-2" />
                  Create Your First Deck
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {cards.map((card, index) => {
              const { isOverdue, daysUntilDue } = getDueDateStatus(card.due_date);
              
              return (
                <div 
                  key={card.id} 
                  className={`group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 animate-fade-in h-full flex flex-col ${
                    isOverdue 
                      ? 'ring-2 ring-destructive/20 bg-destructive/5' 
                      : ''
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex flex-col h-full gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                          <FolderOpen className="h-3 w-3" />
                          <span className="truncate">{card.folder_name}</span>
                          <span className="text-muted-foreground/60">/</span>
                          <BookOpen className="h-3 w-3" />
                          <span className="truncate">{card.deck_name}</span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg text-card-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                        {card.front}
                      </h3>
                      <p className="text-muted-foreground line-clamp-3 leading-relaxed text-sm">
                        {card.back}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-3 mt-auto">
                      <div className={`text-xs px-3 py-2 rounded-full font-medium shadow-sm whitespace-nowrap ${
                        isOverdue 
                          ? 'bg-destructive/10 text-destructive border border-destructive/20' 
                          : daysUntilDue === 0 
                            ? 'bg-warning/10 text-warning border border-warning/20' 
                            : 'bg-primary/10 text-primary border border-primary/20'
                      }`}>
                        {isOverdue 
                          ? 'Overdue' 
                          : daysUntilDue === 0 
                            ? 'Due today' 
                            : `Due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`
                        }
                      </div>
                      
                      <div className="text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded">
                        {new Date(card.due_date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: new Date(card.due_date).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        )}
        </div>
      </main>
      </div>
    </div>
  );
};

export default Home;
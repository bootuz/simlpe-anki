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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10">
      {/* Header */}
      <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between h-full px-6">
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
      <main className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Cards Due for Review</h2>
          <p className="text-muted-foreground">
            All your flashcards sorted by due date
          </p>
        </div>

        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No cards to review</h3>
            <p className="text-muted-foreground text-center mb-6">
              Create some flashcards to start studying
            </p>
            <Button onClick={() => navigate("/study")}>
              <FolderOpen className="h-4 w-4 mr-2" />
              Go to Deck Manager
            </Button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {cards.map((card) => {
              const { isOverdue, daysUntilDue } = getDueDateStatus(card.due_date);
              
              return (
                <div 
                  key={card.id} 
                  className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                    isOverdue 
                      ? 'bg-destructive/5 border-destructive/20' 
                      : 'bg-card border-border'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-muted-foreground">
                          {card.folder_name} / {card.deck_name}
                        </span>
                      </div>
                      <h3 className="font-medium text-card-foreground mb-2 truncate">
                        {card.front}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {card.back}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        isOverdue 
                          ? 'bg-destructive/10 text-destructive' 
                          : daysUntilDue === 0 
                            ? 'bg-warning/10 text-warning' 
                            : 'bg-muted text-muted-foreground'
                      }`}>
                        {isOverdue 
                          ? 'Overdue' 
                          : daysUntilDue === 0 
                            ? 'Due today' 
                            : `Due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`
                        }
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        {new Date(card.due_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
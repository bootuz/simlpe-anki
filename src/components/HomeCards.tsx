import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, BookOpen } from "lucide-react";
import { format } from "date-fns";

interface CardWithDetails {
  id: string;
  front: string;
  back: string;
  deck_id: string;
  deck_name: string;
  folder_name: string | null;
  due_date: string;
  state: string;
  difficulty: number;
  stability: number;
}

export function HomeCards() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cards, setCards] = useState<CardWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCards();
    }
  }, [user]);

  const loadCards = async () => {
    try {
      setLoading(true);
      
      // First get all cards with FSRS data
      const { data: cardsData, error: cardsError } = await supabase
        .from("cards")
        .select(`
          *,
          card_fsrs(due_date, state, difficulty, stability)
        `);

      if (cardsError) throw cardsError;

      // Get deck information
      const { data: decksData, error: decksError } = await supabase
        .from("decks")
        .select(`
          id,
          name,
          folder_id,
          folders(name)
        `);

      if (decksError) throw decksError;

      // Transform and combine the data
      const transformedCards: CardWithDetails[] = cardsData
        .filter((card: any) => card.card_fsrs && card.card_fsrs.length > 0)
        .map((card: any) => {
          const deck = decksData.find((d: any) => d.id === card.deck_id);
          const fsrs = card.card_fsrs[0]; // Get the first FSRS data

          return {
            id: card.id,
            front: card.front,
            back: card.back,
            deck_id: card.deck_id,
            deck_name: deck?.name || 'Unknown Deck',
            folder_name: deck?.folders?.name || null,
            due_date: fsrs.due_date,
            state: fsrs.state,
            difficulty: fsrs.difficulty,
            stability: fsrs.stability,
          };
        })
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

      setCards(transformedCards);
    } catch (error) {
      console.error("Error loading cards:", error);
      toast({
        title: "Error",
        description: "Failed to load cards",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case "New": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "Learning": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "Review": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "Relearning": return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const isDue = (dueDate: string) => {
    return new Date(dueDate) <= new Date();
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="h-48">
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full mb-3" />
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No cards yet</h3>
        <p className="text-muted-foreground">Create some decks and add cards to get started with your studies!</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Study Cards</h2>
          <p className="text-muted-foreground">
            {cards.filter(card => isDue(card.due_date)).length} cards due for review
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {cards.map((card) => (
          <Card 
            key={card.id} 
            className={`h-48 transition-all duration-200 hover:shadow-lg cursor-pointer ${
              isDue(card.due_date) ? 'ring-2 ring-primary/20 bg-primary/5' : ''
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm font-medium truncate">
                    {card.folder_name && (
                      <span className="text-muted-foreground">{card.folder_name} / </span>
                    )}
                    {card.deck_name}
                  </CardTitle>
                </div>
                <Badge 
                  variant="secondary" 
                  className={`ml-2 text-xs ${getStateColor(card.state)}`}
                >
                  {card.state}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground line-clamp-2">
                  {card.front}
                </div>
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {card.back}
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span className={isDue(card.due_date) ? 'text-primary font-medium' : ''}>
                  {isDue(card.due_date) ? 'Due now' : `Due ${format(new Date(card.due_date), 'MMM d')}`}
                </span>
                {isDue(card.due_date) && <Clock className="h-3 w-3 text-primary" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
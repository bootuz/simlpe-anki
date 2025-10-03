import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCardMutations } from "@/hooks/useOptimizedQueries";

interface CardData {
  id: string;
  front: string;
  back: string;
  deck_id: string;
  created_at: string;
  updated_at: string;
  state?: number;
  due?: string;
}

export const useCardManagement = (
  cards: CardData[],
  setCards: React.Dispatch<React.SetStateAction<CardData[]>>,
  updateDeckCardCount: (deckId: string, change: number) => void
) => {
  const { toast } = useToast();
  const { addCard: addCardMutation } = useCardMutations();
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());

  const handleCardSelection = useCallback((cardId: string) => {
    setSelectedCards(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(cardId)) {
        newSelected.delete(cardId);
      } else {
        newSelected.add(cardId);
      }
      return newSelected;
    });
  }, []);

  const addCard = useCallback(async (
    front: string,
    back: string,
    deckId: string,
    tags: string[] = []
  ): Promise<boolean> => {
    try {
      const result = await addCardMutation.mutateAsync({
        front: front.trim(),
        back: back.trim(),
        deckId,
        tags
      });

      const newCard: CardData = {
        ...result,
        state: 0, // 0 = New
        due: null
      };
      
      setCards(prev => [...prev, newCard]);
      updateDeckCardCount(deckId, 1);
      
      return true;
    } catch (error) {
      console.error("Error adding card:", error);
      return false;
    }
  }, [addCardMutation, setCards, updateDeckCardCount]);

  const deleteCard = useCallback(async (cardId: string): Promise<boolean> => {
    try {
      const cardToDelete = cards.find(card => card.id === cardId);
      if (!cardToDelete) return false;

      const { error } = await supabase
        .from("cards")
        .delete()
        .eq("id", cardId);

      if (error) throw error;

      setCards(prev => prev.filter(card => card.id !== cardId));
      updateDeckCardCount(cardToDelete.deck_id, -1);
      
      toast({
        title: "Success",
        description: "Card deleted successfully"
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting card:", error);
      toast({
        title: "Error",
        description: "Failed to delete card",
        variant: "destructive"
      });
      return false;
    }
  }, [cards, setCards, updateDeckCardCount, toast]);

  const editCard = useCallback(async (
    cardId: string,
    front: string,
    back: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("cards")
        .update({ front, back })
        .eq("id", cardId);

      if (error) throw error;

      setCards(prev => prev.map(card => 
        card.id === cardId ? { ...card, front, back } : card
      ));
      
      toast({
        title: "Success",
        description: "Card updated successfully"
      });
      
      return true;
    } catch (error) {
      console.error("Error updating card:", error);
      toast({
        title: "Error",
        description: "Failed to update card",
        variant: "destructive"
      });
      return false;
    }
  }, [setCards, toast]);

  const bulkDeleteCards = useCallback(async (): Promise<boolean> => {
    if (selectedCards.size === 0) return false;
    
    try {
      const cardIds = Array.from(selectedCards);
      const cardsToDelete = cards.filter(card => selectedCards.has(card.id));
      
      const { error } = await supabase
        .from("cards")
        .delete()
        .in("id", cardIds);

      if (error) throw error;

      setCards(prev => prev.filter(card => !selectedCards.has(card.id)));
      
      // Update card counts for affected decks
      const deckUpdates = new Map<string, number>();
      cardsToDelete.forEach(card => {
        deckUpdates.set(card.deck_id, (deckUpdates.get(card.deck_id) || 0) + 1);
      });
      
      deckUpdates.forEach((count, deckId) => {
        updateDeckCardCount(deckId, -count);
      });
      
      setSelectedCards(new Set());
      
      toast({
        title: "Success",
        description: `${cardIds.length} cards deleted successfully`
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting cards:", error);
      toast({
        title: "Error",
        description: "Failed to delete cards",
        variant: "destructive"
      });
      return false;
    }
  }, [selectedCards, cards, setCards, updateDeckCardCount, toast]);

  return {
    selectedCards,
    setSelectedCards,
    handleCardSelection,
    addCard,
    deleteCard,
    editCard,
    bulkDeleteCards
  };
};
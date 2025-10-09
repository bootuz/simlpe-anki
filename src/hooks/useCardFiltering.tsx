import { useMemo } from "react";

interface CardData {
  id: string;
  front: string;
  back: string;
  deck_id: string;
  created_at: string;
  updated_at: string;
  state?: string;
  due_date?: string;
}

export const useCardFiltering = (
  cards: CardData[],
  searchQuery: string,
  filterState: string
) => {
  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!card.front.toLowerCase().includes(query) && 
            !card.back.toLowerCase().includes(query)) {
          return false;
        }
      }

      // State filter
      if (filterState !== "all") {
        if (!card.state || card.state.toLowerCase() !== filterState.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [cards, searchQuery, filterState]);

  const sortedCards = useMemo(() => {
    return filteredCards.sort((a, b) => {
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [filteredCards]);

  const cardStats = useMemo(() => {
    const total = cards.length;
    const filtered = filteredCards.length;
    const newCards = cards.filter(card => !card.state || card.state === 'New').length;
    const learningCards = cards.filter(card => card.state === 'Learning').length;
    const reviewCards = cards.filter(card => card.state === 'Review').length;
    const relearningCards = cards.filter(card => card.state === 'Relearning').length;

    return {
      total,
      filtered,
      new: newCards,
      learning: learningCards,
      review: reviewCards,
      relearning: relearningCards
    };
  }, [cards, filteredCards]);

  return {
    filteredCards: sortedCards,
    cardStats
  };
};
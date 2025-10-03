import { useMemo } from "react";

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

      // State filter (state is now a number: 0=New, 1=Learning, 2=Review, 3=Relearning)
      if (filterState !== "all") {
        const stateMap: Record<string, number> = {
          'new': 0,
          'learning': 1,
          'review': 2,
          'relearning': 3
        };
        const expectedState = stateMap[filterState.toLowerCase()];
        if (card.state !== expectedState) {
          return false;
        }
      }

      return true;
    });
  }, [cards, searchQuery, filterState]);

  const sortedCards = useMemo(() => {
    return filteredCards.sort((a, b) => {
      if (a.due && b.due) {
        return new Date(a.due).getTime() - new Date(b.due).getTime();
      }
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [filteredCards]);

  const cardStats = useMemo(() => {
    const total = cards.length;
    const filtered = filteredCards.length;
    // State: 0=New, 1=Learning, 2=Review, 3=Relearning
    const newCards = cards.filter(card => !card.state || card.state === 0).length;
    const learningCards = cards.filter(card => card.state === 1).length;
    const reviewCards = cards.filter(card => card.state === 2).length;
    const relearningCards = cards.filter(card => card.state === 3).length;

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
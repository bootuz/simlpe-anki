import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Query keys for better cache management
export const QUERY_KEYS = {
  cardsWithDetails: (userId: string) => ['cards-with-details', userId],
  studyCards: (userId: string) => ['study-cards', userId],
  deckCardCounts: (userId: string) => ['deck-card-counts', userId],
} as const;

// Hook for fetching cards with all details using the view
export function useCardsWithDetails() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: QUERY_KEYS.cardsWithDetails(user?.id || ''),
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('cards_with_details')
        .select('*')
        .order('created_at');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Hook for fetching study cards (due for review)
export function useStudyCards() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: QUERY_KEYS.studyCards(user?.id || ''),
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('cards_with_details')
        .select('*')
        .or('due_date.is.null,due_date.lte.' + new Date().toISOString());
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes (study data changes more frequently)
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook for optimized card operations with cache updates
export function useCardMutations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addCard = useMutation({
    mutationFn: async ({ front, back, deckId, tags }: { front: string; back: string; deckId: string; tags?: string[] }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('cards')
        .insert({
          front: front.trim(),
          back: back.trim(),
          deck_id: deckId,
          user_id: user.id,
          tags: tags || []
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (newCard) => {
      // Optimistically update the cache
      queryClient.setQueryData(
        QUERY_KEYS.cardsWithDetails(user?.id || ''),
        (oldData: any[]) => {
          if (!oldData) return [newCard];
          return [...oldData, { ...newCard, state: 'New', due_date: null }];
        }
      );
      
      // Invalidate related queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.studyCards(user?.id || '') });
      
      toast({
        title: "Success",
        description: "Card added successfully"
      });
    },
    onError: (error) => {
      console.error("Error adding card:", error);
      toast({
        title: "Error",
        description: "Failed to add card",
        variant: "destructive"
      });
    }
  });

  const updateCard = useMutation({
    mutationFn: async ({ id, front, back }: { id: string; front: string; back: string }) => {
      const { error } = await supabase
        .from('cards')
        .update({ front, back })
        .eq('id', id);
      
      if (error) throw error;
      return { id, front, back };
    },
    onSuccess: ({ id, front, back }) => {
      // Optimistically update the cache
      queryClient.setQueryData(
        QUERY_KEYS.cardsWithDetails(user?.id || ''),
        (oldData: any[]) => {
          if (!oldData) return [];
          return oldData.map(card => 
            card.id === id ? { ...card, front, back } : card
          );
        }
      );
      
      toast({
        title: "Success",
        description: "Card updated successfully"
      });
    },
    onError: (error) => {
      console.error("Error updating card:", error);
      toast({
        title: "Error",
        description: "Failed to update card",
        variant: "destructive"
      });
    }
  });

  const deleteCard = useMutation({
    mutationFn: async (cardId: string) => {
      // Delete cascade will handle card_fsrs automatically due to foreign key constraint
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', cardId);
      
      if (error) throw error;
      return cardId;
    },
    onSuccess: (cardId) => {
      // Optimistically update the cache
      queryClient.setQueryData(
        QUERY_KEYS.cardsWithDetails(user?.id || ''),
        (oldData: any[]) => {
          if (!oldData) return [];
          return oldData.filter(card => card.id !== cardId);
        }
      );
      
      // Invalidate study cards query
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.studyCards(user?.id || '') });
      
      toast({
        title: "Success",
        description: "Card deleted successfully"
      });
    },
    onError: (error) => {
      console.error("Error deleting card:", error);
      toast({
        title: "Error",
        description: "Failed to delete card",
        variant: "destructive"
      });
    }
  });

  const deleteCards = useMutation({
    mutationFn: async (cardIds: string[]) => {
      // Delete cascade will handle card_fsrs automatically
      const { error } = await supabase
        .from('cards')
        .delete()
        .in('id', cardIds);
      
      if (error) throw error;
      return cardIds;
    },
    onSuccess: (cardIds) => {
      // Optimistically update the cache
      queryClient.setQueryData(
        QUERY_KEYS.cardsWithDetails(user?.id || ''),
        (oldData: any[]) => {
          if (!oldData) return [];
          return oldData.filter(card => !cardIds.includes(card.id));
        }
      );
      
      // Invalidate study cards query
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.studyCards(user?.id || '') });
      
      toast({
        title: "Success",
        description: `${cardIds.length} cards deleted successfully`
      });
    },
    onError: (error) => {
      console.error("Error deleting cards:", error);
      toast({
        title: "Error",
        description: "Failed to delete cards",
        variant: "destructive"
      });
    }
  });

  return {
    addCard,
    updateCard,
    deleteCard,
    deleteCards,
  };
}

// Hook for real-time subscriptions with optimistic updates
export function useRealtimeSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return {
    subscribeToCards: () => {
      if (!user?.id) return;

      const channel = supabase
        .channel('cards-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'cards',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            // Invalidate queries to refetch fresh data
            queryClient.invalidateQueries({ 
              queryKey: QUERY_KEYS.cardsWithDetails(user.id) 
            });
            queryClient.invalidateQueries({ 
              queryKey: QUERY_KEYS.studyCards(user.id) 
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'cards',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            // Invalidate queries when cards change
            queryClient.invalidateQueries({ 
              queryKey: QUERY_KEYS.cardsWithDetails(user.id)
            });
            queryClient.invalidateQueries({ 
              queryKey: QUERY_KEYS.studyCards(user.id) 
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  };
}
import { useState } from 'react';

// Hook for managing multiple loading states efficiently
export function useLoadingStates() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const setLoading = (key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: isLoading }));
  };

  const isLoading = (key: string) => loadingStates[key] || false;

  const anyLoading = () => Object.values(loadingStates).some(loading => loading);

  const reset = () => setLoadingStates({});

  return {
    setLoading,
    isLoading,
    anyLoading,
    reset,
    loadingStates
  };
}

// Common loading keys for consistency across the app
export const LOADING_KEYS = {
  CARDS: 'cards',
  FOLDERS: 'folders',
  DECKS: 'decks',
  ADD_CARD: 'add_card',
  UPDATE_CARD: 'update_card',
  DELETE_CARD: 'delete_card',
  STUDY: 'study',
  AUTH: 'auth'
} as const;
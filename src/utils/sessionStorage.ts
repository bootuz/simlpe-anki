// Study session persistence utilities

export interface StoredSession {
  startTime: string;
  cardsStudied: number;
  correctAnswers: number;
  incorrectAnswers: number;
  currentCardIndex: number;
  totalCards: number;
  lastActivity: string;
  userId: string;
}

const SESSION_STORAGE_KEY = 'study-session';
const MAX_SESSION_AGE_HOURS = 24;

/**
 * Save current session state to localStorage
 */
export const saveSession = (session: Omit<StoredSession, 'lastActivity'>): void => {
  try {
    const sessionData: StoredSession = {
      ...session,
      lastActivity: new Date().toISOString()
    };
    
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
  } catch (error) {
    // Silently fail if localStorage is not available
    console.warn('Failed to save session to localStorage:', error);
  }
};

/**
 * Load session state from localStorage
 */
export const loadSession = (): StoredSession | null => {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return null;
    
    const session: StoredSession = JSON.parse(stored);
    
    // Check if session is too old
    const lastActivity = new Date(session.lastActivity);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > MAX_SESSION_AGE_HOURS) {
      // Session expired, clean it up
      clearSession();
      return null;
    }
    
    return session;
  } catch (error) {
    // If parsing fails, clear corrupted data
    clearSession();
    return null;
  }
};

/**
 * Check if there's an active session for the given user
 */
export const hasActiveSession = (userId: string): StoredSession | null => {
  const session = loadSession();
  
  if (!session || session.userId !== userId) {
    return null;
  }
  
  return session;
};

/**
 * Clear session from localStorage
 */
export const clearSession = (): void => {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    // Silently fail if localStorage is not available
  }
};

/**
 * Update session activity timestamp
 */
export const updateSessionActivity = (): void => {
  const session = loadSession();
  if (session) {
    saveSession({
      startTime: session.startTime,
      cardsStudied: session.cardsStudied,
      correctAnswers: session.correctAnswers,
      incorrectAnswers: session.incorrectAnswers,
      currentCardIndex: session.currentCardIndex,
      totalCards: session.totalCards,
      userId: session.userId
    });
  }
};

/**
 * Format session duration for display
 */
export const formatSessionDuration = (startTime: string, currentTime?: number): string => {
  const start = new Date(startTime).getTime();
  const now = currentTime || Date.now();
  const duration = now - start;
  
  const minutes = Math.floor(duration / (1000 * 60));
  const seconds = Math.floor((duration % (1000 * 60)) / 1000);
  
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
};
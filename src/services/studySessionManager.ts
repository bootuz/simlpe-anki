import { supabase } from '@/integrations/supabase/client';
import { getFSRSServiceForUser, Rating, type FSRSCard } from '@/services/fsrsService';

export interface StudyCard {
  id: string;
  front: string;
  back: string;
  deck_id: string;
  deck_name: string;
  folder_name: string;
  due_date: string | null;
  created_at: string;
  state?: string;
  tags?: string[];
}

export interface SessionCard extends StudyCard {
  sessionPriority: number;
  failedInSession: boolean;
  timesFailedInSession: number;
  lastShownAt?: Date;
}

export interface SessionStats {
  totalCards: number;
  cardsStudied: number;
  cardsRemaining: number;
  correctAnswers: number;
  incorrectAnswers: number;
  sessionStartTime: Date;
  sessionDuration?: number;
  averageResponseTime?: number;
}

export type StudyMode = 'daily_review' | 'deck_specific' | 'catch_up' | 'new_cards' | 'custom';

export interface StudySessionConfig {
  mode: StudyMode;
  deckId?: string;
  maxCards?: number;
  includeNew?: boolean;
  includeReview?: boolean;
  includeLearning?: boolean;
  tags?: string[];
}

export class StudySessionManager {
  private userId: string;
  private sessionCards: SessionCard[] = [];
  private sessionStats: SessionStats;
  private sessionActive: boolean = false;
  private currentCardIndex: number = 0;
  private sessionConfig: StudySessionConfig;

  constructor(userId: string, config: StudySessionConfig) {
    this.userId = userId;
    this.sessionConfig = config;
    this.sessionStats = {
      totalCards: 0,
      cardsStudied: 0,
      cardsRemaining: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      sessionStartTime: new Date()
    };
  }

  /**
   * Initialize study session by loading appropriate cards
   */
  async initializeSession(): Promise<{
    success: boolean;
    cards?: SessionCard[];
    error?: string;
  }> {
    try {
      const cards = await this.loadCardsForSession();
      
      if (cards.length === 0) {
        return { 
          success: false, 
          error: 'No cards available for study with current settings' 
        };
      }

      // Convert to session cards with priority
      this.sessionCards = cards.map((card, index) => ({
        ...card,
        sessionPriority: this.calculateInitialPriority(card, index),
        failedInSession: false,
        timesFailedInSession: 0
      }));

      // Sort by priority (lower number = higher priority)
      this.sortCardsByPriority();

      this.sessionStats = {
        ...this.sessionStats,
        totalCards: this.sessionCards.length,
        cardsRemaining: this.sessionCards.length
      };

      this.sessionActive = true;
      this.currentCardIndex = 0;

      return { success: true, cards: this.sessionCards };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Load cards based on session configuration
   */
  private async loadCardsForSession(): Promise<StudyCard[]> {
    // Use the secure RPC function instead of direct view access
    let baseCards = await supabase.from('cards_with_details').select('*');
    
    if (baseCards.error) {
      throw new Error(`Failed to load cards: ${baseCards.error.message}`);
    }
    
    let filteredCards = baseCards.data || [];

    // Apply deck filter if specified
    if (this.sessionConfig.deckId) {
      filteredCards = filteredCards.filter(card => card.deck_id === this.sessionConfig.deckId);
    }

    // Apply tag filter if specified
    // Note: Tag filtering disabled as tags field not available in view
    // if (this.sessionConfig.tags && this.sessionConfig.tags.length > 0) {
    //   filteredCards = filteredCards.filter(card => 
    //     card.tags && this.sessionConfig.tags!.some(tag => card.tags!.includes(tag))
    //   );
    // }

    let cards: StudyCard[] = filteredCards.map(card => ({
      id: card.id,
      front: card.front,
      back: card.back,
      deck_id: card.deck_id,
      deck_name: card.deck_name || 'Uncategorized Deck',
      folder_name: card.folder_name || 'Personal',
      due_date: card.due_date,
      created_at: card.created_at,
      state: card.state || 'New',
      tags: [] // Note: tags field not in view, using fallback
    }));

    // Filter cards based on study mode and configuration
    cards = this.filterCardsByMode(cards);

    // Apply max cards limit if specified
    if (this.sessionConfig.maxCards && cards.length > this.sessionConfig.maxCards) {
      cards = cards.slice(0, this.sessionConfig.maxCards);
    }

    return cards;
  }

  /**
   * Filter cards based on study mode and availability rules
   */
  private filterCardsByMode(cards: StudyCard[]): StudyCard[] {
    const now = new Date();

    return cards.filter(card => {
      switch (this.sessionConfig.mode) {
        case 'daily_review':
          // Include: New cards, overdue cards, learning cards due within 30 min
          return this.isCardAvailableForDailyReview(card, now);
          
        case 'deck_specific':
          // Include all cards from specified deck that are due
          return this.isCardAvailableForDailyReview(card, now);
          
        case 'catch_up':
          // Include only overdue cards
          return card.due_date && new Date(card.due_date) < now;
          
        case 'new_cards':
          // Include only new cards
          return !card.due_date;
          
        case 'custom':
          // Apply custom filters based on configuration
          return this.isCardAvailableForCustomStudy(card, now);
          
        default:
          return this.isCardAvailableForDailyReview(card, now);
      }
    });
  }

  /**
   * Check if card is available for daily review
   */
  private isCardAvailableForDailyReview(card: StudyCard, now: Date): boolean {
    // Non-graduated cards (New, Learning, Relearning) are always available
    if (card.state !== 'Review') {
      return true;
    }
    
    // Review cards follow normal schedule - only available when due
    if (!card.due_date) return false;
    const dueDate = new Date(card.due_date);
    return dueDate <= now;
  }

  /**
   * Check if card is available for custom study
   */
  private isCardAvailableForCustomStudy(card: StudyCard, now: Date): boolean {
    // Apply individual filters based on configuration
    if (this.sessionConfig.includeNew && !card.due_date) return true;
    if (this.sessionConfig.includeReview && card.state === 'Review') return true;
    if (this.sessionConfig.includeLearning && 
        (card.state === 'Learning' || card.state === 'Relearning')) return true;

    return false;
  }

  /**
   * Calculate initial priority for card ordering
   */
  private calculateInitialPriority(card: StudyCard, index: number): number {
    // Priority order: Learning/Relearning → New → Review
    if (card.state === 'Learning' || card.state === 'Relearning') {
      return index; // Highest priority
    } else if (!card.due_date) {
      return 1000 + index; // Medium priority
    } else {
      return 2000 + index; // Lowest priority
    }
  }

  /**
   * Sort cards by priority
   */
  private sortCardsByPriority(): void {
    this.sessionCards.sort((a, b) => a.sessionPriority - b.sessionPriority);
  }

  /**
   * Get current card for study
   */
  getCurrentCard(): SessionCard | null {
    if (!this.sessionActive || this.currentCardIndex >= this.sessionCards.length) {
      return null;
    }
    return this.sessionCards[this.currentCardIndex];
  }

  /**
   * Process card review and handle failed cards
   */
  async processCardReview(rating: Rating): Promise<{
    success: boolean;
    nextCard?: SessionCard | null;
    sessionComplete?: boolean;
    error?: string;
  }> {
    if (!this.sessionActive) {
      return { success: false, error: 'No active session' };
    }

    const currentCard = this.getCurrentCard();
    if (!currentCard) {
      return { success: false, error: 'No current card' };
    }

    try {
      // Process review through FSRS
      const fsrsService = await getFSRSServiceForUser(this.userId);
      const result = await fsrsService.processReview(
        currentCard.id, 
        rating, 
        this.userId
      );

      if (!result.success) {
        return { success: false, error: result.error };
      }

      // Update session stats
      this.sessionStats.cardsStudied++;
      if (rating === Rating.Again) {
        this.sessionStats.incorrectAnswers++;
        
        // Handle failed card - re-queue in session
        currentCard.failedInSession = true;
        currentCard.timesFailedInSession++;
        currentCard.lastShownAt = new Date();
        
        // Re-calculate priority to show again after some delay
        currentCard.sessionPriority = this.calculateFailedCardPriority(currentCard);
        
        // Don't advance to next card yet - this card will be shown again
        this.sortCardsByPriority();
        
      } else {
        this.sessionStats.correctAnswers++;
        
        // Remove card from session (move to next)
        this.sessionCards.splice(this.currentCardIndex, 1);
        this.sessionStats.cardsRemaining = this.sessionCards.length;
        
        // Don't increment currentCardIndex since we removed an item
      }

      // Check if session is complete
      if (this.sessionCards.length === 0) {
        this.sessionActive = false;
        this.sessionStats.sessionDuration = 
          Date.now() - this.sessionStats.sessionStartTime.getTime();
        
        return { 
          success: true, 
          nextCard: null, 
          sessionComplete: true 
        };
      }

      // Reset index if it's out of bounds
      if (this.currentCardIndex >= this.sessionCards.length) {
        this.currentCardIndex = 0;
      }

      return { 
        success: true, 
        nextCard: this.getCurrentCard(),
        sessionComplete: false 
      };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Calculate priority for failed cards (show again after delay)
   */
  private calculateFailedCardPriority(card: SessionCard): number {
    const now = new Date();
    const lastShown = card.lastShownAt || now;
    const minutesSinceShown = (now.getTime() - lastShown.getTime()) / (1000 * 60);
    
    // Show failed cards again after 1 minute (FSRS learning step)
    if (minutesSinceShown < 1) {
      // Keep at lower priority until 1 minute has passed
      return 9999 + card.timesFailedInSession;
    } else {
      // Higher priority to be shown soon
      return card.timesFailedInSession * 10;
    }
  }

  /**
   * Get session statistics
   */
  getSessionStats(): SessionStats {
    return {
      ...this.sessionStats,
      cardsRemaining: this.sessionCards.length
    };
  }

  /**
   * End session manually
   */
  endSession(): SessionStats {
    this.sessionActive = false;
    this.sessionStats.sessionDuration = 
      Date.now() - this.sessionStats.sessionStartTime.getTime();
    return this.sessionStats;
  }

  /**
   * Check if session is active
   */
  isSessionActive(): boolean {
    return this.sessionActive;
  }

  /**
   * Get remaining cards count
   */
  getRemainingCardsCount(): number {
    return this.sessionCards.length;
  }

  /**
   * Get current session cards (for UI updates)
   */
  getSessionCards(): SessionCard[] {
    return [...this.sessionCards];
  }

  /**
   * Get total session cards (including completed)
   */
  getTotalCardsCount(): number {
    return this.sessionStats.totalCards;
  }

  /**
   * Skip current card (useful for testing or if user wants to skip)
   */
  skipCurrentCard(): SessionCard | null {
    if (!this.sessionActive) return null;
    
    this.currentCardIndex = (this.currentCardIndex + 1) % this.sessionCards.length;
    return this.getCurrentCard();
  }

  /**
   * Get session configuration
   */
  getSessionConfig(): StudySessionConfig {
    return this.sessionConfig;
  }

  /**
   * Update session configuration (restart required)
   */
  updateSessionConfig(config: Partial<StudySessionConfig>): void {
    this.sessionConfig = { ...this.sessionConfig, ...config };
  }
}
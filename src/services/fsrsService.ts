import { 
  FSRS, 
  createEmptyCard, 
  generatorParameters, 
  Card as FSRSCard, 
  Rating, 
  State, 
  RecordLog,
  FSRSParameters,
  type Steps,
  ReviewLog
} from 'ts-fsrs';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type CardFSRSRow = {
  id: string;
  user_id: string;
  deck_id: string;
  front: string;
  back: string;
  tags: string[] | null;
  state: number;
  due: string | null;
  stability: number | null;
  difficulty: number | null;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  last_review: string | null;
  created_at: string;
  updated_at: string;
};

type CardFSRSUpdate = {
  fsrs_state?: number;
  reps?: number;
  lapses?: number;
  difficulty?: number | null;
  stability?: number | null;
  scheduled_days?: number;
  elapsed_days?: number;
  due_date?: string | null;
  last_review?: string | null;
  updated_at?: string;
};

type CardFSRSInsert = Partial<CardFSRSUpdate> & {
  front: string;
  back: string;
  deck_id: string;
  user_id: string;
};
// Temporary interface until database types are regenerated
interface ReviewLogInsert {
  card_id: string;
  user_id: string;
  rating: number;
  review_time: string;
  review_log: ReviewLog; // Single ReviewLog from chosen RecordLogItem for rollback
}


export class FSRSService {
  private fsrsInstance: FSRS;
  private parameters: FSRSParameters;
  private static instanceCache = new Map<string, FSRSService>();

  constructor(config: Partial<FSRSParameters> = {}) {
    // Generate optimized FSRS parameters
    this.parameters = generatorParameters({
      request_retention: config.request_retention ?? 0.9,
      maximum_interval: config.maximum_interval ?? 36500, // 100 years
      enable_fuzz: config.enable_fuzz ?? true,
      enable_short_term: config.enable_short_term ?? true,
      learning_steps: config.learning_steps ?? ["1m", "10m"] as Steps,
      relearning_steps: config.relearning_steps ?? ["10m"] as Steps
    });

    // Initialize FSRS instance with parameters
    this.fsrsInstance = new FSRS(this.parameters);
  }

  /**
   * Get or create cached FSRSService instance for a user
   */
  static async getInstanceForUser(userId: string): Promise<FSRSService> {
    if (this.instanceCache.has(userId)) {
      return this.instanceCache.get(userId)!;
    }

    // Load user-specific FSRS parameters
    const { data: userParams } = await supabase
      .from('fsrs_parameters')
      .select('parameters')
      .eq('user_id', userId)
      .single();

    const config = userParams?.parameters as Partial<FSRSParameters> || {};
    const instance = new FSRSService(config);
    this.instanceCache.set(userId, instance);
    return instance;
  }

  /**
   * Clear cached instance for a user (useful when parameters change)
   */
  static clearUserCache(userId: string): void {
    this.instanceCache.delete(userId);
  }

  /**
   * Create a new empty card using ts-fsrs
   */
  createNewCard(createdAt?: Date): FSRSCard {
    return createEmptyCard(createdAt || new Date());
  }

  /**
   * Convert database cards record to FSRSCard object
   */
  dbRecordToFSRSCard(record: CardFSRSRow): FSRSCard {
    // Convert database record to FSRS Card object

    // Fallback to manual conversion for legacy data
    const now = new Date();
    
    let lastReview: Date | undefined;
    if (record.last_review) {
      lastReview = new Date(record.last_review);
      if (isNaN(lastReview.getTime())) {
        lastReview = new Date(record.created_at);
      }
    }

    let dueDate: Date;
    const rawDue = (record as any).due ?? (record as any).due_date;
    if (rawDue) {
      dueDate = new Date(rawDue as string);
      if (isNaN(dueDate.getTime())) {
        dueDate = now;
      }
    } else {
      // For new cards with no due date, they should be due immediately
      // This ensures they appear in study queue but with correct status
      dueDate = now;
    }

    const rawState = (record as any).state ?? (record as any).fsrs_state ?? 0;
    let state: State;
    switch (rawState) {
      case 0: state = State.New; break;
      case 1: state = State.Learning; break;
      case 2: state = State.Review; break;
      case 3: state = State.Relearning; break;
      default: state = State.New;
    }

    // Cards table doesn't have learning_steps, default to 0
    const learningSteps = 0;

    return {
      due: dueDate,
      stability: record.stability,
      difficulty: record.difficulty,
      elapsed_days: record.elapsed_days,
      scheduled_days: record.scheduled_days,
      reps: record.reps,
      lapses: record.lapses,
      state: state,
      last_review: lastReview,
      learning_steps: learningSteps
    };
  }

  /**
   * Convert FSRSCard to database update record
   * Now includes FSRS card data caching for better performance
   */
  fsrsCardToDbUpdate(card: FSRSCard): CardFSRSUpdate {
    return {
      fsrs_state: card.state,
      reps: card.reps,
      lapses: card.lapses,
      difficulty: card.difficulty,
      stability: card.stability,
      scheduled_days: card.scheduled_days,
      elapsed_days: card.elapsed_days,
      due_date: card.due.toISOString(),
      last_review: card.last_review?.toISOString() || null,
      updated_at: new Date().toISOString()
    } as any;
  }

  /**
   * Schedule the next review for a card based on user rating using ts-fsrs directly
   */
  scheduleReview(card: FSRSCard, rating: Rating, reviewDate?: Date): {
    updatedCard: FSRSCard;
    recordLog: RecordLog;
  } {
    const reviewTime = reviewDate || new Date();
    const schedulingCards = this.fsrsInstance.repeat(card, reviewTime);
    
    return {
      updatedCard: schedulingCards[rating].card,
      recordLog: schedulingCards
    };
  }

  /**
   * Preview scheduling for all ratings - useful for showing intervals to user
   */
  previewScheduling(card: FSRSCard, reviewDate?: Date): RecordLog {
    const reviewTime = reviewDate || new Date();
    return this.fsrsInstance.repeat(card, reviewTime);
  }

  /**
   * Get card retrievability (memory strength)
   */
  getRetrievability(card: FSRSCard, reviewDate?: Date): number {
    try {
      const reviewTime = reviewDate || new Date();
      const retrievability = this.fsrsInstance.get_retrievability(card, reviewTime);
      
      // Ensure retrievability is a number and handle edge cases
      const numRetrievability = Number(retrievability);
      if (isNaN(numRetrievability) || !isFinite(numRetrievability)) {
        // For new cards (State.New), return a default high retrievability
        if (card.state === State.New) {
          return 1.0; // 100% for new cards
        }
        // For other problematic cases, return 0
        return 0.0;
      }
      
      // Clamp the value between 0 and 1
      return Math.max(0, Math.min(1, numRetrievability));
    } catch (error) {
      console.warn('Error getting retrievability:', error);
      // Return default value based on card state
      return card.state === State.New ? 1.0 : 0.0;
    }
  }

  /**
   * Create initial FSRS data for a new card (not used - cards created with default values)
   */
  createInitialFSRSData(): Partial<CardFSRSUpdate> {
    const newCard = this.createNewCard();
    
    return {
      fsrs_state: State.New,
      reps: newCard.reps,
      lapses: newCard.lapses,
      difficulty: newCard.difficulty,
      stability: newCard.stability,
      scheduled_days: newCard.scheduled_days,
      elapsed_days: newCard.elapsed_days,
      due_date: null,
      last_review: null
    };
  }

  /**
   * Process a review and update the database with review log storage
   */
  async processReview(
    cardId: string, 
    rating: Rating, 
    userId: string,
    reviewDate?: Date
  ): Promise<{
    success: boolean;
    updatedCard?: FSRSCard;
    nextReviewIn?: string;
    error?: string;
  }> {
    try {
      // Get current FSRS data from cards table
      const { data: fsrsData, error: fetchError } = await supabase
        .from('cards')
        .select('*')
        .eq('id', cardId)
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        return { success: false, error: `Failed to fetch card data: ${fetchError.message}` };
      }

      // Convert to FSRSCard (cast to any because types.ts doesn't match actual DB schema)
      const currentCard = this.dbRecordToFSRSCard(fsrsData as any);

      // Schedule next review using ts-fsrs API
      const { updatedCard, recordLog } = this.scheduleReview(currentCard, rating, reviewDate);

      // Convert back to database format
      const dbUpdate = this.fsrsCardToDbUpdate(updatedCard);

      // Update card state in cards table
      const { error: cardUpdateError } = await supabase
        .from('cards')
        .update(dbUpdate)
        .eq('id', cardId)
        .eq('user_id', userId);

      if (cardUpdateError) {
        return { success: false, error: `Failed to update card: ${cardUpdateError.message}` };
      }

      // Store review log with specific ReviewLog from chosen RecordLogItem
      const reviewLogData = this.createReviewLogInsert(
        cardId, 
        userId, 
        rating, 
        recordLog[rating].log,
        reviewDate || new Date()
      );

      const { error: logError } = await supabase
        .from('review_logs')
        .insert(reviewLogData as any);

      if (logError) {
        console.warn('Failed to store review log:', logError.message);
        // Don't fail the review if log storage fails
      }

      // Calculate next review time for user feedback
      const nextReviewIn = this.calculateNextReviewTime(updatedCard);

      return {
        success: true,
        updatedCard,
        nextReviewIn
      };

    } catch (error) {
      return { 
        success: false, 
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Calculate human-readable next review time
   */
  private calculateNextReviewTime(card: FSRSCard): string {
    const now = new Date();
    const timeDiff = card.due.getTime() - now.getTime();

    if (card.state === State.Learning || card.state === State.Relearning) {
      const minutes = Math.ceil(timeDiff / (1000 * 60));
      if (minutes < 60) {
        return `${minutes} minute${minutes === 1 ? '' : 's'}`;
      } else {
        const hours = Math.ceil(minutes / 60);
        return `${hours} hour${hours === 1 ? '' : 's'}`;
      }
    } else {
      const days = Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
      return `${days} day${days === 1 ? '' : 's'}`;
    }
  }

  /**
   * Get FSRS parameters for debugging/configuration
   */
  getParameters(): FSRSParameters {
    return this.parameters;
  }

  /**
   * Update FSRS parameters and reinitialize
   */
  updateParameters(config: Partial<FSRSParameters>): void {
    this.parameters = generatorParameters({
      request_retention: config.request_retention ?? this.parameters.request_retention,
      maximum_interval: config.maximum_interval ?? this.parameters.maximum_interval,
      enable_fuzz: config.enable_fuzz ?? this.parameters.enable_fuzz,
      enable_short_term: config.enable_short_term ?? this.parameters.enable_short_term,
      learning_steps: (config.learning_steps ?? this.parameters.learning_steps) as Steps,
      relearning_steps: (config.relearning_steps ?? this.parameters.relearning_steps) as Steps
    });

    this.fsrsInstance = new FSRS(this.parameters);
  }

  /**
   * Update user FSRS parameters in database
   */
  async updateUserParameters(userId: string, config: Partial<FSRSParameters>): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { error } = await supabase
        .from('fsrs_parameters')
        .update({
          parameters: config as any,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      // Clear cached instance so it will be recreated with new parameters
      FSRSService.clearUserCache(userId);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Create review log insert data with single ReviewLog from chosen outcome
   */
  private createReviewLogInsert(
    cardId: string,
    userId: string,
    rating: Rating,
    reviewLog: ReviewLog,
    reviewTime: Date
  ): ReviewLogInsert {
    return {
      card_id: cardId,
      user_id: userId,
      rating: rating,
      review_time: reviewTime.toISOString(),
      review_log: reviewLog as any // Store the ReviewLog directly
    };
  }

  /**
   * Undo the last review for a card using ts-fsrs rollback functionality
   */
  async undoLastReview(
    cardId: string,
    userId: string
  ): Promise<{
    success: boolean;
    restoredCard?: FSRSCard;
    error?: string;
  }> {
    try {
      // Get the most recent review log for this card
      const { data: lastLog, error: logError } = await supabase
        .from('review_logs')
        .select('*')
        .eq('card_id', cardId)
        .eq('user_id', userId)
        .order('review_time', { ascending: false })
        .limit(1)
        .single();

      if (logError || !lastLog) {
        return { 
          success: false, 
          error: 'No review found to undo' 
        };
      }

      // Get current card state from cards table
      const { data: currentFsrsData, error: fetchError } = await supabase
        .from('cards')
        .select('*')
        .eq('id', cardId)
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        return { 
          success: false, 
          error: `Failed to fetch current card data: ${fetchError.message}` 
        };
      }

      // Convert current database record to FSRSCard (cast to any because types.ts doesn't match actual DB schema)
      const currentCard = this.dbRecordToFSRSCard(currentFsrsData as any);

      // Extract ReviewLog from stored JSONB (single ReviewLog from chosen outcome)
      const reviewLog = lastLog.review_log as any;
      
      // Use ts-fsrs rollback to get the card state before the review
      const restoredCard = this.fsrsInstance.rollback(currentCard, reviewLog);

      // Convert to database format
      const dbUpdate = this.fsrsCardToDbUpdate(restoredCard);

      // Update card state in cards table
      const { error: updateError } = await supabase
        .from('cards')
        .update(dbUpdate)
        .eq('id', cardId)
        .eq('user_id', userId);

      if (updateError) {
        return { 
          success: false, 
          error: `Failed to restore card state: ${updateError.message}` 
        };
      }

      // Delete the review log
      const { error: deleteError } = await supabase
        .from('review_logs')
        .delete()
        .eq('id', lastLog.id);

      if (deleteError) {
        console.warn('Failed to delete review log after undo:', deleteError.message);
        // Don't fail the undo if log deletion fails
      }

      return {
        success: true,
        restoredCard
      };

    } catch (error) {
      return {
        success: false,
        error: `Unexpected error during undo: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Create default FSRS service instance with default parameters
export const fsrsService = new FSRSService();

// Helper function to get user-specific FSRS service
export async function getFSRSServiceForUser(userId: string): Promise<FSRSService> {
  return FSRSService.getInstanceForUser(userId);
}

// Export commonly used types and enums
export { Rating, State } from 'ts-fsrs';
export type { Card as FSRSCard, ReviewLog, RecordLog } from 'ts-fsrs';
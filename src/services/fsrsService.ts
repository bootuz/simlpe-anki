import { 
  fsrs, 
  createEmptyCard, 
  generatorParameters, 
  Card as FSRSCard, 
  Rating, 
  State, 
  RecordLog,
  FSRSParameters,
  type Steps
} from 'ts-fsrs';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type CardFSRSRow = Database['public']['Tables']['card_fsrs']['Row'];
type CardFSRSInsert = Database['public']['Tables']['card_fsrs']['Insert'];
type CardFSRSUpdate = Database['public']['Tables']['card_fsrs']['Update'];
type ReviewLogRow = Database['public']['Tables']['review_logs']['Row'];
type ReviewLogInsert = Database['public']['Tables']['review_logs']['Insert'];

export class FSRSService {
  private fsrsInstance: ReturnType<typeof fsrs>;
  private parameters: FSRSParameters;

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
    this.fsrsInstance = fsrs(this.parameters);
  }

  /**
   * Create a new empty card using ts-fsrs
   */
  createNewCard(createdAt?: Date): FSRSCard {
    return createEmptyCard(createdAt || new Date());
  }

  /**
   * Convert database card_fsrs record to FSRSCard
   */
  dbRecordToFSRSCard(record: CardFSRSRow): FSRSCard {
    const now = new Date();
    
    // Parse and validate dates
    let lastReview: Date | undefined;
    if (record.last_review) {
      lastReview = new Date(record.last_review);
      if (isNaN(lastReview.getTime())) {
        lastReview = new Date(record.created_at);
      }
    }

    let dueDate: Date;
    if (record.due_date) {
      dueDate = new Date(record.due_date);
      if (isNaN(dueDate.getTime())) {
        dueDate = now;
      }
    } else {
      dueDate = now; // New cards are due immediately
    }

    // Convert string state to FSRS State enum
    let state: State;
    switch (record.state) {
      case 'New':
        state = State.New;
        break;
      case 'Learning':
        state = State.Learning;
        break;
      case 'Review':
        state = State.Review;
        break;
      case 'Relearning':
        state = State.Relearning;
        break;
      default:
        state = State.New;
    }

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
      learning_steps: record.learning_steps
    };
  }

  /**
   * Convert FSRSCard to database update record
   */
  fsrsCardToDbUpdate(card: FSRSCard): CardFSRSUpdate {
    // Convert FSRS State enum to string
    let stateString: string;
    switch (card.state) {
      case State.New:
        stateString = 'New';
        break;
      case State.Learning:
        stateString = 'Learning';
        break;
      case State.Review:
        stateString = 'Review';
        break;
      case State.Relearning:
        stateString = 'Relearning';
        break;
      default:
        stateString = 'New';
    }

    return {
      state: stateString,
      reps: card.reps,
      lapses: card.lapses,
      difficulty: card.difficulty,
      stability: card.stability,
      scheduled_days: card.scheduled_days,
      elapsed_days: card.elapsed_days,
      due_date: card.due.toISOString(),
      last_review: card.last_review?.toISOString() || null,
      learning_steps: card.learning_steps,
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Schedule the next review for a card based on user rating
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
   * Create initial FSRS data for a new card
   */
  createInitialFSRSData(cardId: string, userId: string, createdAt?: Date): CardFSRSInsert {
    const newCard = this.createNewCard(createdAt);
    
    return {
      card_id: cardId,
      user_id: userId,
      state: 'New',
      reps: newCard.reps,
      lapses: newCard.lapses,
      difficulty: newCard.difficulty,
      stability: newCard.stability,
      scheduled_days: newCard.scheduled_days,
      elapsed_days: newCard.elapsed_days,
      due_date: null, // New cards have no due date until first review
      last_review: null,
      learning_steps: newCard.learning_steps
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
      // Get current FSRS data
      const { data: fsrsData, error: fetchError } = await supabase
        .from('card_fsrs')
        .select('*')
        .eq('card_id', cardId)
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        return { success: false, error: `Failed to fetch card data: ${fetchError.message}` };
      }

      // Convert to FSRSCard and store previous state
      const currentCard = this.dbRecordToFSRSCard(fsrsData);
      const previousCard = { ...currentCard };

      // Schedule next review
      const { updatedCard, recordLog } = this.scheduleReview(currentCard, rating, reviewDate);

      // Convert back to database format
      const dbUpdate = this.fsrsCardToDbUpdate(updatedCard);

      // Begin transaction: update card and store review log
      const { error: updateError } = await supabase.rpc('process_review_with_log', {
        p_card_id: cardId,
        p_user_id: userId,
        p_card_update: dbUpdate,
        p_review_log: this.createReviewLogInsert(
          cardId, 
          userId, 
          rating, 
          updatedCard, 
          previousCard, 
          reviewDate || new Date()
        )
      });

      if (updateError) {
        // Fallback to manual transaction if RPC doesn't exist
        const { error: cardUpdateError } = await supabase
          .from('card_fsrs')
          .update(dbUpdate)
          .eq('card_id', cardId)
          .eq('user_id', userId);

        if (cardUpdateError) {
          return { success: false, error: `Failed to update card: ${cardUpdateError.message}` };
        }

        // Store review log
        const reviewLogData = this.createReviewLogInsert(
          cardId, 
          userId, 
          rating, 
          updatedCard, 
          previousCard, 
          reviewDate || new Date()
        );

        const { error: logError } = await supabase
          .from('review_logs')
          .insert(reviewLogData);

        if (logError) {
          console.warn('Failed to store review log:', logError.message);
          // Don't fail the review if log storage fails
        }
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

    this.fsrsInstance = fsrs(this.parameters);
  }

  /**
   * Create review log insert data from FSRS cards and review information
   */
  private createReviewLogInsert(
    cardId: string,
    userId: string,
    rating: Rating,
    updatedCard: FSRSCard,
    previousCard: FSRSCard,
    reviewTime: Date
  ): ReviewLogInsert {
    // Convert FSRS State enums to string
    const stateToString = (state: State): string => {
      switch (state) {
        case State.New: return 'New';
        case State.Learning: return 'Learning';
        case State.Review: return 'Review';
        case State.Relearning: return 'Relearning';
        default: return 'New';
      }
    };

    return {
      card_id: cardId,
      user_id: userId,
      rating: rating,
      state: stateToString(updatedCard.state),
      due_date: updatedCard.due.toISOString(),
      stability: updatedCard.stability,
      difficulty: updatedCard.difficulty,
      elapsed_days: updatedCard.elapsed_days,
      scheduled_days: updatedCard.scheduled_days,
      reps: updatedCard.reps,
      lapses: updatedCard.lapses,
      previous_state: stateToString(previousCard.state),
      previous_due_date: previousCard.due.toISOString(),
      previous_stability: previousCard.stability,
      previous_difficulty: previousCard.difficulty,
      previous_elapsed_days: previousCard.elapsed_days,
      previous_scheduled_days: previousCard.scheduled_days,
      previous_reps: previousCard.reps,
      previous_lapses: previousCard.lapses,
      previous_learning_steps: previousCard.learning_steps,
      review_time: reviewTime.toISOString()
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

      // Get current card state
      const { data: currentFsrsData, error: fetchError } = await supabase
        .from('card_fsrs')
        .select('*')
        .eq('card_id', cardId)
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        return { 
          success: false, 
          error: `Failed to fetch current card data: ${fetchError.message}` 
        };
      }

      // Convert log data back to FSRS format for rollback
      const stringToState = (state: string): State => {
        switch (state) {
          case 'New': return State.New;
          case 'Learning': return State.Learning;
          case 'Review': return State.Review;
          case 'Relearning': return State.Relearning;
          default: return State.New;
        }
      };

      // Restore the previous card state from the log
      const restoredCard: FSRSCard = {
        due: new Date(lastLog.previous_due_date || new Date()),
        stability: lastLog.previous_stability,
        difficulty: lastLog.previous_difficulty,
        elapsed_days: lastLog.previous_elapsed_days,
        scheduled_days: lastLog.previous_scheduled_days,
        reps: lastLog.previous_reps,
        lapses: lastLog.previous_lapses,
        state: stringToState(lastLog.previous_state),
        last_review: lastLog.previous_reps > 0 ? new Date(lastLog.previous_due_date || new Date()) : undefined,
        learning_steps: lastLog.previous_learning_steps
      };

      // Convert back to database format
      const dbUpdate = this.fsrsCardToDbUpdate(restoredCard);

      // Update card and delete the review log in a transaction
      const { error: undoError } = await supabase.rpc('undo_review', {
        p_card_id: cardId,
        p_user_id: userId,
        p_log_id: lastLog.id,
        p_card_update: dbUpdate
      });

      if (undoError) {
        // Fallback to manual transaction
        const { error: updateError } = await supabase
          .from('card_fsrs')
          .update(dbUpdate)
          .eq('card_id', cardId)
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

  /**
   * Get review history for a card
   */
  async getReviewHistory(
    cardId: string,
    userId: string,
    limit: number = 10
  ): Promise<{
    success: boolean;
    logs?: ReviewLogRow[];
    error?: string;
  }> {
    try {
      const { data: logs, error } = await supabase
        .from('review_logs')
        .select('*')
        .eq('card_id', cardId)
        .eq('user_id', userId)
        .order('review_time', { ascending: false })
        .limit(limit);

      if (error) {
        return {
          success: false,
          error: `Failed to fetch review history: ${error.message}`
        };
      }

      return {
        success: true,
        logs: logs || []
      };
    } catch (error) {
      return {
        success: false,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Create default FSRS service instance
export const fsrsService = new FSRSService();

// Export commonly used types and enums
export { Rating, State } from 'ts-fsrs';
export type { Card as FSRSCard } from 'ts-fsrs';
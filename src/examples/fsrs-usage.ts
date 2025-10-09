/**
 * Example usage of the new FSRS service and utilities
 * This file demonstrates how to use the new FSRS integration throughout the application
 */

import { fsrsService, Rating } from '@/services/fsrsService';
import { 
  getDueDateInfo, 
  getCardStats, 
  getRecommendedAction,
  formatInterval,
  getStateColorClass,
  getDifficultyLabel 
} from '@/utils/fsrsUtils';

// Example 1: Processing a review with the FSRS service
async function handleCardReview(cardId: string, userId: string, userRating: 'again' | 'hard' | 'good' | 'easy') {
  // Map user rating to FSRS Rating enum
  const ratingMap = {
    'again': Rating.Again,
    'hard': Rating.Hard,
    'good': Rating.Good,
    'easy': Rating.Easy
  };

  const result = await fsrsService.processReview(cardId, ratingMap[userRating], userId);
  
  if (result.success) {
    console.log(`Card reviewed successfully! Next review in ${result.nextReviewIn}`);
    return result.updatedCard;
  } else {
    console.error('Review failed:', result.error);
    return null;
  }
}

// Example 2: Getting comprehensive card statistics
function displayCardStatistics(fsrsData: {
  state: string;
  due_date: string | null;
  reps: number;
  lapses: number;
  scheduled_days: number;
  difficulty: number;
  stability: number;
}) {
  const stats = getCardStats(fsrsData);
  
  console.log('Card Statistics:');
  console.log(`- State: ${stats.cardState}`);
  console.log(`- Total Reviews: ${stats.totalReviews}`);
  console.log(`- Success Rate: ${stats.correctRate}%`);
  console.log(`- Current Interval: ${formatInterval(stats.averageInterval)}`);
  console.log(`- Difficulty: ${getDifficultyLabel(stats.difficulty)} (${stats.difficulty})`);
  console.log(`- Stability: ${stats.stability} days`);
  console.log(`- Next Review: ${stats.nextReview}`);
}

// Example 3: Getting due date information with styling
function renderDueDateBadge(dueDate: string | Date) {
  const dueDateInfo = getDueDateInfo(dueDate);
  
  return {
    text: dueDateInfo.label,
    className: `badge ${getDueDateStatusClass(dueDateInfo)}`,
    priority: dueDateInfo.status === 'ready' ? 'high' : 
               dueDateInfo.status === 'new' ? 'medium' : 'low'
  };
}

// Example 4: Getting study recommendations
function getStudyRecommendations(cards: Array<{ 
  id: string; 
  fsrs_data: {
    state: string;
    due_date: string | null;
    reps: number;
    lapses: number;
    scheduled_days: number;
    difficulty: number;
    stability: number;
  }
}>) {
  return cards.map(card => {
    const recommendation = getRecommendedAction(card.fsrs_data);
    const stats = getCardStats(card.fsrs_data);
    
    return {
      cardId: card.id,
      action: recommendation.action,
      reason: recommendation.reason,
      priority: recommendation.priority,
      state: stats.cardState,
      nextReview: stats.nextReview
    };
  }).sort((a, b) => {
    // Sort by priority: high -> medium -> low
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

// Example 5: Creating a new card with FSRS data
async function createNewCardWithFSRS(cardId: string, userId: string) {
  // The FSRS service provides initial data for new cards
  const initialData = fsrsService.createInitialFSRSData(cardId, userId);
  
  console.log('Initial FSRS data for new card:', {
    state: initialData.state,
    difficulty: initialData.difficulty,
    stability: initialData.stability,
    reps: initialData.reps,
    lapses: initialData.lapses
  });
  
  return initialData;
}

// Example 6: Customizing FSRS parameters
function customizeFSRSParameters() {
  // Update FSRS parameters for different learning preferences
  // Using native FSRSParameters type from ts-fsrs
  fsrsService.updateParameters({
    request_retention: 0.95, // Higher retention rate (more conservative)
    maximum_interval: 180,   // Max 6 months between reviews
    enable_fuzz: true,       // Add randomness to intervals
    learning_steps: ["1m", "5m", "10m"] as const, // More learning steps
    relearning_steps: ["5m", "1d"] as const       // Longer relearning process
  });
  
  console.log('Updated FSRS parameters:', fsrsService.getParameters());
}

// Helper function to get due date status class (referenced in example 3)
function getDueDateStatusClass(info: { status: string }) {
  switch (info.status) {
    case 'overdue':
      return 'text-destructive bg-destructive/10';
    case 'due-now':
    case 'due-soon':
      return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950';
    default:
      return 'text-muted-foreground bg-muted/50';
  }
}

export {
  handleCardReview,
  displayCardStatistics,
  renderDueDateBadge,
  getStudyRecommendations,
  createNewCardWithFSRS,
  customizeFSRSParameters
};
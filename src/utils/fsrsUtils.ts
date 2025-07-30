import { date_diff, formatDate, State, Rating } from "ts-fsrs";
import { fsrsService, type FSRSCard } from "@/services/fsrsService";

export interface DueDateInfo {
  status: 'overdue' | 'due-now' | 'due-soon' | 'future';
  label: string;
  timeValue: number;
  timeUnit: 'minutes' | 'hours' | 'days';
}

export interface CardStats {
  totalReviews: number;
  correctRate: number;
  averageInterval: number;
  nextReview: string;
  cardState: string;
  difficulty: number;
  stability: number;
}

/**
 * Calculate due date status using FSRS date utilities
 */
export function getDueDateInfo(dueDate: string | Date): DueDateInfo {
  const due = new Date(dueDate);
  const now = new Date();
  
  // Use FSRS date_diff for accurate calculation
  const diffMs = due.getTime() - now.getTime();
  
  if (diffMs < 0) {
    // Overdue
    const absDiffMs = Math.abs(diffMs);
    const minutes = Math.ceil(absDiffMs / (1000 * 60));
    
    if (minutes < 60) {
      return {
        status: 'overdue',
        label: `${minutes}m overdue`,
        timeValue: minutes,
        timeUnit: 'minutes'
      };
    } else if (minutes < 24 * 60) {
      const hours = Math.ceil(minutes / 60);
      return {
        status: 'overdue',
        label: `${hours}h overdue`,
        timeValue: hours,
        timeUnit: 'hours'
      };
    } else {
      const days = Math.ceil(minutes / (60 * 24));
      return {
        status: 'overdue',
        label: `${days}d overdue`,
        timeValue: days,
        timeUnit: 'days'
      };
    }
  }
  
  // Due in the future
  const minutes = Math.ceil(diffMs / (1000 * 60));
  
  if (minutes <= 1) {
    return {
      status: 'due-now',
      label: 'Due now',
      timeValue: 0,
      timeUnit: 'minutes'
    };
  } else if (minutes <= 60) {
    return {
      status: 'due-soon',
      label: `Due in ${minutes}m`,
      timeValue: minutes,
      timeUnit: 'minutes'
    };
  } else if (minutes < 24 * 60) {
    const hours = Math.ceil(minutes / 60);
    return {
      status: 'due-soon',
      label: `Due in ${hours}h`,
      timeValue: hours,
      timeUnit: 'hours'
    };
  } else {
    const days = Math.ceil(minutes / (60 * 24));
    
    if (days === 1) {
      return {
        status: 'due-soon',
        label: 'Due tomorrow',
        timeValue: 1,
        timeUnit: 'days'
      };
    } else if (days < 7) {
      return {
        status: 'future',
        label: `Due in ${days}d`,
        timeValue: days,
        timeUnit: 'days'
      };
    } else {
      return {
        status: 'future',
        label: formatDate(due),
        timeValue: days,
        timeUnit: 'days'
      };
    }
  }
}

/**
 * Get CSS class for due date status
 */
export function getDueDateStatusClass(info: DueDateInfo): string {
  switch (info.status) {
    case 'overdue':
      return 'text-destructive';
    case 'due-now':
    case 'due-soon':
      return 'text-orange-600 dark:text-orange-400';
    default:
      return 'text-muted-foreground';
  }
}

/**
 * Check if a card is due for study (overdue, due now, or due soon)
 */
export function isCardDueForStudy(dueDate: string | Date): boolean {
  const info = getDueDateInfo(dueDate);
  return info.status === 'overdue' || info.status === 'due-now' || info.status === 'due-soon';
}

/**
 * Get comprehensive statistics for a card using FSRS data
 */
export function getCardStats(fsrsData: {
  state: string;
  due_date: string | null;
  reps: number;
  lapses: number;
  scheduled_days: number;
  difficulty: number;
  stability: number;
}): CardStats {
  const state = getStateLabel(fsrsData.state);
  const nextReview = fsrsData.due_date ? 
    getDueDateInfo(fsrsData.due_date).label : 
    'Not scheduled';

  return {
    totalReviews: fsrsData.reps || 0,
    correctRate: calculateCorrectRate(fsrsData.reps, fsrsData.lapses),
    averageInterval: fsrsData.scheduled_days || 0,
    nextReview,
    cardState: state,
    difficulty: Math.round((fsrsData.difficulty || 0) * 100) / 100,
    stability: Math.round((fsrsData.stability || 0) * 100) / 100
  };
}

/**
 * Calculate correct rate based on reps and lapses
 */
function calculateCorrectRate(reps: number, lapses: number): number {
  if (reps === 0) return 0;
  const correctAnswers = reps - lapses;
  return Math.round((correctAnswers / reps) * 100);
}

/**
 * Convert FSRS state to human-readable label
 */
export function getStateLabel(state: string): string {
  switch (state) {
    case 'New':
      return 'New Card';
    case 'Learning':
      return 'Learning';
    case 'Review':
      return 'Review';
    case 'Relearning':
      return 'Relearning';
    default:
      return 'Unknown';
  }
}

/**
 * Get difficulty level description
 */
export function getDifficultyLabel(difficulty: number): string {
  if (difficulty < 3) return 'Easy';
  if (difficulty < 6) return 'Medium';
  if (difficulty < 8) return 'Hard';
  return 'Very Hard';
}

/**
 * Get stability level description
 */
export function getStabilityLabel(stability: number): string {
  if (stability < 1) return 'Very Low';
  if (stability < 7) return 'Low';
  if (stability < 30) return 'Medium';
  if (stability < 180) return 'High';
  return 'Very High';
}

/**
 * Calculate retention probability for a card at current time
 */
export function calculateRetention(stability: number, elapsedDays: number): number {
  // FSRS retention formula: R = exp(-elapsed_days / stability)
  const retention = Math.exp(-elapsedDays / stability);
  return Math.round(retention * 100);
}

/**
 * Get recommended action based on card state and due date
 */
export function getRecommendedAction(fsrsData: {
  due_date: string | null;
  state: string;
}): {
  action: 'study' | 'review' | 'wait';
  reason: string;
  priority: 'high' | 'medium' | 'low';
} {
  const now = new Date();
  const dueDate = fsrsData.due_date ? new Date(fsrsData.due_date) : null;
  
  if (!dueDate) {
    return {
      action: 'study',
      reason: 'New card ready to study',
      priority: 'high'
    };
  }
  
  const isOverdue = dueDate.getTime() < now.getTime();
  const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (isOverdue) {
    const hoursOverdue = Math.abs(hoursUntilDue);
    return {
      action: 'study',
      reason: `Overdue by ${hoursOverdue < 24 ? Math.round(hoursOverdue) + 'h' : Math.round(hoursOverdue / 24) + 'd'}`,
      priority: hoursOverdue > 24 ? 'high' : 'medium'
    };
  }
  
  if (hoursUntilDue <= 1) {
    return {
      action: 'review',
      reason: 'Due soon',
      priority: 'medium'
    };
  }
  
  return {
    action: 'wait',
    reason: `Due in ${hoursUntilDue < 24 ? Math.round(hoursUntilDue) + 'h' : Math.round(hoursUntilDue / 24) + 'd'}`,
    priority: 'low'
  };
}

/**
 * Format FSRS interval for display
 */
export function formatInterval(days: number): string {
  if (days < 1) {
    const hours = Math.round(days * 24);
    const minutes = Math.round(days * 24 * 60);
    if (minutes < 60) {
      return `${minutes}m`;
    }
    return `${hours}h`;
  }
  
  if (days < 30) {
    return `${Math.round(days)}d`;
  }
  
  if (days < 365) {
    const months = Math.round(days / 30);
    return `${months}mo`;
  }
  
  const years = Math.round(days / 365);
  return `${years}y`;
}

/**
 * Get color class for card state
 */
export function getStateColorClass(state: string): string {
  switch (state) {
    case 'New':
      return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950';
    case 'Learning':
      return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950';
    case 'Review':
      return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950';
    case 'Relearning':
      return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950';
    default:
      return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950';
  }
}

/**
 * Get difficulty color class
 */
export function getDifficultyColorClass(difficulty: number): string {
  if (difficulty < 3) return 'text-green-600 dark:text-green-400';
  if (difficulty < 6) return 'text-yellow-600 dark:text-yellow-400';
  if (difficulty < 8) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}
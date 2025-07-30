import { date_diff, formatDate } from "ts-fsrs";

export interface DueDateInfo {
  status: 'overdue' | 'due-now' | 'due-soon' | 'future';
  label: string;
  timeValue: number;
  timeUnit: 'minutes' | 'hours' | 'days';
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
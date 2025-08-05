import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle, AlertTriangle, Check } from 'lucide-react';
import { getFSRSServiceForUser, Rating, type FSRSCard, type RecordLog } from '@/services/fsrsService';

interface SchedulingPreviewProps {
  card: FSRSCard;
  userId: string;
  onRatingSelect: (rating: Rating) => void;
  disabled?: boolean;
}

interface PreviewData {
  rating: Rating;
  label: string;
  interval: string;
  icon: React.ReactNode;
  className: string;
  description: string;
}

export function SchedulingPreview({ card, userId, onRatingSelect, disabled = false }: SchedulingPreviewProps) {
  const [previews, setPreviews] = useState<PreviewData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generatePreviews();
  }, [card, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const generatePreviews = async () => {
    try {
      setLoading(true);
      const fsrsService = await getFSRSServiceForUser(userId);
      const now = new Date();
      const recordLog: RecordLog = fsrsService.previewScheduling(card, now);

      const previewData: PreviewData[] = [
        {
          rating: Rating.Again,
          label: 'Again',
          interval: formatInterval(recordLog[Rating.Again].card, now),
          icon: <XCircle className="h-4 w-4" />,
          className: 'border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive',
          description: 'I need to study this more'
        },
        {
          rating: Rating.Hard,
          label: 'Hard',
          interval: formatInterval(recordLog[Rating.Hard].card, now),
          icon: <AlertTriangle className="h-4 w-4" />,
          className: 'border-amber-500 text-amber-700 hover:bg-amber-50 hover:text-amber-800',
          description: 'It was difficult to remember'
        },
        {
          rating: Rating.Good,
          label: 'Good',
          interval: formatInterval(recordLog[Rating.Good].card, now),
          icon: <Check className="h-4 w-4" />,
          className: 'border-primary text-primary hover:bg-primary/10 hover:text-primary',
          description: 'I remembered it correctly'
        },
        {
          rating: Rating.Easy,
          label: 'Easy',
          interval: formatInterval(recordLog[Rating.Easy].card, now),
          icon: <CheckCircle className="h-4 w-4" />,
          className: 'border-green-600 text-green-700 hover:bg-green-50 hover:text-green-800',
          description: 'It was very easy to remember'
        }
      ];

      setPreviews(previewData);
    } catch (error) {
      console.error('Error generating scheduling previews:', error);
      // Fallback to basic buttons without previews
      setPreviews([]);
    } finally {
      setLoading(false);
    }
  };

  const formatInterval = (futureCard: FSRSCard, baseTime?: Date): string => {
    const now = baseTime || new Date();
    const timeDiff = futureCard.due.getTime() - now.getTime();

    // For very small differences (less than 30 seconds), show minimum meaningful interval
    if (timeDiff < 30000) {
      return 'Now';
    }

    const minutes = Math.ceil(timeDiff / (1000 * 60)); // Use ceil to avoid showing 0m
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) {
      return `${Math.max(1, minutes)}m`; // Ensure minimum 1 minute
    } else if (hours < 24) {
      return `${hours}h`;
    } else if (days < 30) {
      return `${days}d`;
    } else if (days < 365) {
      const months = Math.floor(days / 30);
      return `${months}mo`;
    } else {
      const years = Math.floor(days / 365);
      return `${years}y`;
    }
  };

  const getMemoryStrength = async (): Promise<number> => {
    try {
      const fsrsService = await getFSRSServiceForUser(userId);
      return fsrsService.getRetrievability(card);
    } catch {
      return 0;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">How well did you know this?</p>
        <div className="grid grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-muted/30 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (previews.length === 0) {
    // Fallback to basic buttons
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">How well did you know this?</p>
        <div className="grid grid-cols-4 gap-2">
          <Button 
            onClick={() => onRatingSelect(Rating.Again)}
            variant="outline"
            size="lg"
            disabled={disabled}
            className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive py-3"
          >
            <XCircle className="h-4 w-4 mr-1" />
            Again
          </Button>
          <Button 
            onClick={() => onRatingSelect(Rating.Hard)}
            variant="outline"
            size="lg"
            disabled={disabled}
            className="border-amber-500 text-amber-700 hover:bg-amber-50 hover:text-amber-800 py-3"
          >
            <AlertTriangle className="h-4 w-4 mr-1" />
            Hard
          </Button>
          <Button 
            onClick={() => onRatingSelect(Rating.Good)}
            variant="outline"
            size="lg"
            disabled={disabled}
            className="border-primary text-primary hover:bg-primary/10 hover:text-primary py-3"
          >
            <Check className="h-4 w-4 mr-1" />
            Good
          </Button>
          <Button 
            onClick={() => onRatingSelect(Rating.Easy)}
            variant="outline"
            size="lg"
            disabled={disabled}
            className="border-green-600 text-green-700 hover:bg-green-50 hover:text-green-800 py-3"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Easy
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">How well did you know this?</p>
        <MemoryStrengthBadge card={card} userId={userId} />
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {previews.map((preview) => (
          <Button
            key={preview.rating}
            onClick={() => onRatingSelect(preview.rating)}
            variant="outline"
            size="lg"
            disabled={disabled}
            className={`${preview.className} py-3 flex flex-col h-auto relative group`}
            title={preview.description}
          >
            <div className="flex items-center gap-1 mb-1">
              {preview.icon}
              <span className="font-medium">{preview.label}</span>
            </div>
            <div className="flex items-center gap-1 text-xs opacity-75">
              <Clock className="h-3 w-3" />
              <span>{preview.interval}</span>
            </div>
            
            {/* Tooltip on hover */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              {preview.description}
            </div>
          </Button>
        ))}
      </div>
      
      <p className="text-xs text-muted-foreground text-center">
        Times shown are when you'll see this card again
      </p>
    </div>
  );
}

// Component to show memory strength
function MemoryStrengthBadge({ card, userId }: { card: FSRSCard; userId: string }) {
  const [strength, setStrength] = useState<number | null>(null);

  useEffect(() => {
    const getStrength = async () => {
      try {
        const fsrsService = await getFSRSServiceForUser(userId);
        const retrievability = fsrsService.getRetrievability(card);
        
        // Handle invalid retrievability values
        if (isNaN(retrievability) || !isFinite(retrievability)) {
          // For new cards or cards with invalid retrievability, don't show the badge
          setStrength(null);
          return;
        }
        
        const strengthPercent = Math.round(retrievability * 100);
        // Ensure the percentage is within valid range
        setStrength(Math.max(0, Math.min(100, strengthPercent)));
      } catch (error) {
        console.warn('Error calculating memory strength:', error);
        setStrength(null);
      }
    };

    getStrength();
  }, [card, userId]);

  // Don't show memory badge for invalid values or if calculation failed
  if (strength === null || isNaN(strength)) return null;

  const getVariant = (strength: number) => {
    if (strength >= 90) return 'default';
    if (strength >= 70) return 'secondary';
    if (strength >= 50) return 'outline';
    return 'destructive';
  };

  return (
    <Badge variant={getVariant(strength)} className="text-xs">
      Memory: {strength}%
    </Badge>
  );
}
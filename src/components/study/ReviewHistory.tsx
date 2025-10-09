import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Clock, CheckCircle, XCircle, AlertTriangle, Check } from 'lucide-react';
import { Rating } from '@/services/fsrsService';

interface ReviewHistoryProps {
  cardId: string;
  userId: string;
}

interface ReviewLogEntry {
  id: string;
  rating: number;
  review_time: string;
  created_at: string;
}

export function ReviewHistory({ cardId, userId }: ReviewHistoryProps) {
  const [reviews, setReviews] = useState<ReviewLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviewHistory();
  }, [cardId, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadReviewHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('review_logs')
        .select('id, rating, review_time, created_at')
        .eq('card_id', cardId)
        .eq('user_id', userId)
        .order('review_time', { ascending: false })
        .limit(10); // Show last 10 reviews

      if (error) {
        console.error('Error loading review history:', error);
        return;
      }

      setReviews(data || []);
    } catch (error) {
      console.error('Error loading review history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRatingInfo = (rating: number) => {
    switch (rating) {
      case Rating.Again:
        return {
          label: 'Again',
          icon: <XCircle className="h-3 w-3" />,
          variant: 'destructive' as const,
          color: 'text-red-600'
        };
      case Rating.Hard:
        return {
          label: 'Hard',
          icon: <AlertTriangle className="h-3 w-3" />,
          variant: 'secondary' as const,
          color: 'text-orange-600'
        };
      case Rating.Good:
        return {
          label: 'Good',
          icon: <Check className="h-3 w-3" />,
          variant: 'default' as const,
          color: 'text-blue-600'
        };
      case Rating.Easy:
        return {
          label: 'Easy',
          icon: <CheckCircle className="h-3 w-3" />,
          variant: 'default' as const,
          color: 'text-green-600'
        };
      default:
        return {
          label: 'Unknown',
          icon: <Clock className="h-3 w-3" />,
          variant: 'outline' as const,
          color: 'text-gray-600'
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const minutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${minutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // Less than a week
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Review History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded animate-pulse">
                <div className="h-4 bg-muted rounded w-16"></div>
                <div className="h-4 bg-muted rounded w-20"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Review History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No review history yet. This will show your answers after you review this card.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Review History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {reviews.map((review) => {
            const ratingInfo = getRatingInfo(review.rating);
            return (
              <div
                key={review.id}
                className="flex items-center justify-between p-3 border border-border/50 rounded-lg bg-card/30"
              >
                <div className="flex items-center gap-2">
                  <span className={ratingInfo.color}>
                    {ratingInfo.icon}
                  </span>
                  <Badge variant={ratingInfo.variant} className="text-xs">
                    {ratingInfo.label}
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDate(review.review_time)}
                </span>
              </div>
            );
          })}
        </div>
        {reviews.length === 10 && (
          <p className="text-xs text-muted-foreground text-center mt-3">
            Showing last 10 reviews
          </p>
        )}
      </CardContent>
    </Card>
  );
}
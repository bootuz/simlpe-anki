import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Clock, 
  AlertTriangle, 
  Repeat, 
  Target,
  XCircle
} from 'lucide-react';
import type { SessionCard, SessionStats } from '@/services/studySessionManager';

interface StudyQueueProps {
  sessionCards: SessionCard[];
  currentCardIndex: number;
  sessionStats: SessionStats;
  showDetailed?: boolean;
}

export const StudyQueue: React.FC<StudyQueueProps> = ({
  sessionCards,
  currentCardIndex,
  sessionStats,
  showDetailed = true
}) => {
  const currentCard = sessionCards[currentCardIndex];

  const getCardIcon = (card: SessionCard) => {
    if (card.failedInSession) {
      return <XCircle className="h-3 w-3 text-red-500" />;
    }

    // State: 0=New, 1=Learning, 2=Review, 3=Relearning
    switch (card.state) {
      case 0: // New
        return <BookOpen className="h-3 w-3 text-blue-500" />;
      case 1: // Learning
        return <Repeat className="h-3 w-3 text-orange-500" />;
      case 3: // Relearning
        return <AlertTriangle className="h-3 w-3 text-red-500" />;
      case 2: // Review
        return <Target className="h-3 w-3 text-green-500" />;
      default:
        return <BookOpen className="h-3 w-3 text-gray-500" />;
    }
  };

  const getCardStatusBadge = (card: SessionCard) => {
    if (card.failedInSession) {
      return (
        <Badge variant="destructive" className="text-xs">
          Failed {card.timesFailedInSession}x
        </Badge>
      );
    }

    // State: 0=New, 1=Learning, 2=Review, 3=Relearning
    switch (card.state) {
      case 0:
        return <Badge variant="default" className="text-xs">New</Badge>;
      case 1:
        return <Badge variant="secondary" className="text-xs">Learning</Badge>;
      case 3:
        return <Badge variant="destructive" className="text-xs">Relearning</Badge>;
      case 2:
        return <Badge variant="outline" className="text-xs">Review</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>;
    }
  };

  const getTimeUntilNextCard = (card: SessionCard): string | null => {
    if (!card.failedInSession || !card.lastShownAt) return null;
    
    const now = new Date();
    const timeSince = now.getTime() - card.lastShownAt.getTime();
    const oneMinute = 60 * 1000;
    
    if (timeSince < oneMinute) {
      const secondsRemaining = Math.ceil((oneMinute - timeSince) / 1000);
      return `${secondsRemaining}s`;
    }
    
    return null;
  };

  const progressPercentage = sessionStats.totalCards > 0 
    ? ((sessionStats.cardsStudied / sessionStats.totalCards) * 100) 
    : 0;

  const accuracyPercentage = (sessionStats.cardsStudied > 0)
    ? ((sessionStats.correctAnswers / sessionStats.cardsStudied) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Session Progress */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Session Progress
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {sessionStats.cardsStudied} / {sessionStats.totalCards}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {sessionStats.correctAnswers}
              </div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {sessionStats.incorrectAnswers}
              </div>
              <div className="text-xs text-muted-foreground">Incorrect</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(accuracyPercentage)}%
              </div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Card Info */}
      {currentCard && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Current Card
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getCardIcon(currentCard)}
                <span className="font-medium truncate max-w-32">
                  {currentCard.front.substring(0, 30)}
                  {currentCard.front.length > 30 ? '...' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {getCardStatusBadge(currentCard)}
                {getTimeUntilNextCard(currentCard) && (
                  <Badge variant="outline" className="text-xs">
                    Wait {getTimeUntilNextCard(currentCard)}
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              From: {currentCard.deck_name}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Queue Preview */}
      {showDetailed && sessionCards.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Upcoming Cards ({sessionCards.length - 1})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {sessionCards.slice(currentCardIndex + 1, currentCardIndex + 6).map((card, index) => (
                <div key={card.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-4">
                      {index + 1}
                    </span>
                    {getCardIcon(card)}
                    <span className="text-sm truncate max-w-40">
                      {card.front.substring(0, 25)}
                      {card.front.length > 25 ? '...' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getCardStatusBadge(card)}
                    {getTimeUntilNextCard(card) && (
                      <Badge variant="outline" className="text-xs">
                        {getTimeUntilNextCard(card)}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              
              {sessionCards.length > currentCardIndex + 6 && (
                <div className="text-center text-sm text-muted-foreground py-2">
                  ... and {sessionCards.length - currentCardIndex - 6} more cards
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Queue Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Queue Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3 text-blue-500" />
                  New
                </span>
                <span className="font-medium">
                  {sessionCards.filter(c => c.state === 0).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <Repeat className="h-3 w-3 text-orange-500" />
                  Learning
                </span>
                <span className="font-medium">
                  {sessionCards.filter(c => c.state === 1).length}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3 text-green-500" />
                  Review
                </span>
                <span className="font-medium">
                  {sessionCards.filter(c => c.state === 2).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <XCircle className="h-3 w-3 text-red-500" />
                  Failed
                </span>
                <span className="font-medium">
                  {sessionCards.filter(c => c.failedInSession).length}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
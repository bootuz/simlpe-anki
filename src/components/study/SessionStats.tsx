import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Award,
  Timer,
  BarChart3
} from 'lucide-react';
import type { SessionStats as SessionStatsType } from '@/services/studySessionManager';

interface SessionStatsProps {
  sessionStats: SessionStatsType;
  isSessionComplete?: boolean;
  showDetailed?: boolean;
}

export const SessionStats: React.FC<SessionStatsProps> = ({
  sessionStats,
  isSessionComplete = false,
  showDetailed = true
}) => {
  const formatDuration = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const currentSessionDuration = sessionStats.sessionDuration || 
    (Date.now() - sessionStats.sessionStartTime.getTime());

  const progressPercentage = sessionStats.totalCards > 0 
    ? ((sessionStats.cardsStudied / sessionStats.totalCards) * 100) 
    : 0;

  const accuracyPercentage = sessionStats.cardsStudied > 0
    ? ((sessionStats.correctAnswers / sessionStats.cardsStudied) * 100)
    : 0;

  const averageTimePerCard = sessionStats.cardsStudied > 0
    ? (currentSessionDuration / sessionStats.cardsStudied)
    : 0;

  const getAccuracyColor = (accuracy: number): string => {
    if (accuracy >= 90) return 'text-green-600';
    if (accuracy >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyVariant = (accuracy: number): "default" | "secondary" | "destructive" | "outline" => {
    if (accuracy >= 90) return 'default';
    if (accuracy >= 70) return 'secondary';
    return 'destructive';
  };

  if (!showDetailed) {
    // Compact view for during study
    return (
      <Card className="w-full">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">
                {formatDuration(currentSessionDuration)}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {sessionStats.cardsStudied} / {sessionStats.totalCards}
            </div>
          </div>
          
          <Progress value={progressPercentage} className="h-2 mb-3" />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              {sessionStats.correctAnswers}
            </span>
            <span className="flex items-center gap-1">
              <XCircle className="h-3 w-3 text-red-500" />
              {sessionStats.incorrectAnswers}
            </span>
            <span className={`font-medium ${getAccuracyColor(accuracyPercentage)}`}>
              {Math.round(accuracyPercentage)}%
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Session Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            Session Statistics
            {isSessionComplete && (
              <Badge variant="outline" className="text-xs">
                Complete
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Overview */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {sessionStats.cardsStudied} / {sessionStats.totalCards} cards
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="text-center text-sm font-medium">
              {Math.round(progressPercentage)}% Complete
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
              <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                <CheckCircle className="h-6 w-6" />
                {sessionStats.correctAnswers}
              </div>
              <div className="text-xs text-green-700 dark:text-green-300">
                Correct
              </div>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
              <div className="text-2xl font-bold text-red-600 flex items-center justify-center gap-1">
                <XCircle className="h-6 w-6" />
                {sessionStats.incorrectAnswers}
              </div>
              <div className="text-xs text-red-700 dark:text-red-300">
                Incorrect
              </div>
            </div>
            
            <div className={`text-center p-3 rounded-lg ${
              accuracyPercentage >= 90 ? 'bg-green-50 dark:bg-green-950/20' :
              accuracyPercentage >= 70 ? 'bg-yellow-50 dark:bg-yellow-950/20' :
              'bg-red-50 dark:bg-red-950/20'
            }`}>
              <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${getAccuracyColor(accuracyPercentage)}`}>
                <Award className="h-6 w-6" />
                {Math.round(accuracyPercentage)}%
              </div>
              <div className={`text-xs ${
                accuracyPercentage >= 90 ? 'text-green-700 dark:text-green-300' :
                accuracyPercentage >= 70 ? 'text-yellow-700 dark:text-yellow-300' :
                'text-red-700 dark:text-red-300'
              }`}>
                Accuracy
              </div>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <div className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-1">
                <Timer className="h-6 w-6" />
                {sessionStats.cardsRemaining}
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-300">
                Remaining
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timing Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            Timing Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Started at</span>
                <span className="text-sm font-medium">
                  {formatTime(sessionStats.sessionStartTime)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Duration</span>
                <span className="text-sm font-medium">
                  {formatDuration(currentSessionDuration)}
                </span>
              </div>
              
              {sessionStats.cardsStudied > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg per card</span>
                  <span className="text-sm font-medium">
                    {formatDuration(averageTimePerCard)}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {sessionStats.cardsRemaining > 0 && !isSessionComplete && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Est. time left</span>
                    <span className="text-sm font-medium">
                      {formatDuration(averageTimePerCard * sessionStats.cardsRemaining)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Est. finish</span>
                    <span className="text-sm font-medium">
                      {formatTime(new Date(Date.now() + (averageTimePerCard * sessionStats.cardsRemaining)))}
                    </span>
                  </div>
                </>
              )}
              
              {isSessionComplete && sessionStats.sessionDuration && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Completed at</span>
                  <span className="text-sm font-medium">
                    {formatTime(new Date(sessionStats.sessionStartTime.getTime() + sessionStats.sessionDuration))}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      {sessionStats.cardsStudied > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm">Overall accuracy</span>
                <Badge variant={getAccuracyVariant(accuracyPercentage)} className="text-sm">
                  {Math.round(accuracyPercentage)}%
                  {accuracyPercentage >= 90 ? ' Excellent!' :
                   accuracyPercentage >= 70 ? ' Good' : ' Needs work'}
                </Badge>
              </div>
              
              {averageTimePerCard > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">Study pace</span>
                  <Badge variant="outline" className="text-sm">
                    {formatDuration(averageTimePerCard)} per card
                    {averageTimePerCard < 10000 ? ' Fast' : 
                     averageTimePerCard < 30000 ? ' Normal' : ' Careful'}
                  </Badge>
                </div>
              )}

              {sessionStats.incorrectAnswers > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">Cards to review</span>
                  <Badge variant="secondary" className="text-sm">
                    {sessionStats.incorrectAnswers} cards need attention
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SessionStats;
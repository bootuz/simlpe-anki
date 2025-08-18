import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, TrendingUp, RotateCcw, Play } from "lucide-react";
import { formatSessionDuration, type StoredSession } from "@/utils/sessionStorage";

interface SessionRecoveryDialogProps {
  isOpen: boolean;
  session: StoredSession;
  onContinue: () => void;
  onStartFresh: () => void;
}

export const SessionRecoveryDialog: React.FC<SessionRecoveryDialogProps> = ({
  isOpen,
  session,
  onContinue,
  onStartFresh,
}) => {
  const accuracy = session.cardsStudied > 0 
    ? Math.round((session.correctAnswers / session.cardsStudied) * 100) 
    : 0;

  const remainingCards = session.totalCards - session.cardsStudied;

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Resume Study Session?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You have an active study session in progress. Your previous answers 
                are saved and won't be lost.
              </p>
              
              {/* Session Stats Preview */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="flex items-center justify-center">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-sm font-medium">
                      {formatSessionDuration(session.startTime)}
                    </div>
                    <div className="text-xs text-muted-foreground">Duration</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-center">
                      <Target className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="text-sm font-medium">
                      {session.cardsStudied} / {session.totalCards}
                    </div>
                    <div className="text-xs text-muted-foreground">Progress</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-sm font-medium">{accuracy}%</div>
                    <div className="text-xs text-muted-foreground">Accuracy</div>
                  </div>
                </div>
                
                {remainingCards > 0 && (
                  <div className="text-center pt-2 border-t border-border/50">
                    <Badge variant="outline" className="text-xs">
                      {remainingCards} cards remaining
                    </Badge>
                  </div>
                )}
              </div>
              
              {/* Action Explanation */}
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Play className="h-3 w-3 mt-0.5 text-green-600" />
                  <span><strong>Continue:</strong> Resume from where you left off</span>
                </div>
                <div className="flex items-start gap-2">
                  <RotateCcw className="h-3 w-3 mt-0.5 text-orange-600" />
                  <span><strong>Start Fresh:</strong> Reset timer and stats (learned cards stay learned)</span>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel 
            onClick={onStartFresh}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Start Fresh
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onContinue}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Continue Session
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
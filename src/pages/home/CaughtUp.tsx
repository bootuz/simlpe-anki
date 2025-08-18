import { Button } from "@/components/ui/button";
import { BookOpen, Trophy, Sparkles, Plus, Star } from "lucide-react";

interface CaughtUpProps {
  onManageDecks: () => void;
}

export default function CaughtUp({ onManageDecks }: CaughtUpProps) {
  return (
    <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-16 h-16 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-32 right-24 w-24 h-24 bg-gradient-to-br from-accent/30 to-primary/30 rounded-full blur-xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-10 w-12 h-12 bg-gradient-to-br from-primary/40 to-transparent rounded-full blur-lg animate-pulse delay-300" />
      </div>

      <section className="relative text-center animate-fade-in">
        <div className="max-w-lg mx-auto px-6">
          {/* Trophy Animation */}
          <div className="relative mb-8">
            <div className="relative mx-auto w-32 h-32 mb-6">
              {/* Rotating ring */}
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-spin" style={{ animationDuration: '8s' }} />
              <div className="absolute inset-2 rounded-full border border-accent/40 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />
              
              {/* Central trophy */}
              <div className="absolute inset-6 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-xl">
                  <Trophy className="h-10 w-10 text-white" />
                </div>
              </div>
              
              {/* Floating stars */}
              <Star className="absolute -top-2 -right-2 h-6 w-6 text-primary animate-pulse" />
              <Star className="absolute -bottom-2 -left-2 h-4 w-4 text-accent animate-pulse delay-500" />
              <Sparkles className="absolute top-0 left-0 h-5 w-5 text-primary/70 animate-pulse delay-1000" />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-6 mb-12">
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Amazing!
              </span>
            </h2>
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold text-foreground">You're All Caught Up!</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Fantastic work! You've mastered all your scheduled reviews. 
                <span className="text-primary font-medium"> Your dedication is paying off!</span>
              </p>
            </div>
          </div>

          {/* Achievement Badge */}
          <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 rounded-2xl p-6 mb-10 border border-primary/20">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-primary">Study Streak Active</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Keep your momentum going by checking back tomorrow
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button 
              onClick={onManageDecks} 
              size="lg"
              className="w-full px-8 py-6 text-lg font-semibold bg-gradient-to-r from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90"
            >
              <Plus className="h-5 w-5 mr-3 group-hover:rotate-90 transition-transform duration-300 text-white" />
              Add More Cards
            </Button>
            
            <p className="text-sm text-muted-foreground">
              Or come back later when more cards are ready for review
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

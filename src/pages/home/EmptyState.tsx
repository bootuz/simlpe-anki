import { Button } from "@/components/ui/button";
import { GraduationCap, Brain, TrendingUp, Target, Sparkles } from "lucide-react";

interface EmptyStateProps {
  onManageDecks: () => void;
}

export default function EmptyState({ onManageDecks }: EmptyStateProps) {
  return (
    <section className="max-w-4xl mx-auto animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="relative mb-8">
          <div className="relative mx-auto w-32 h-32 mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/20 to-accent/10 rounded-full blur-2xl scale-110" />
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl animate-pulse" />
              <div className="relative bg-background border-2 border-primary/20 rounded-2xl p-8 shadow-lg w-32 h-32 flex items-center justify-center">
                <GraduationCap className="h-16 w-16 text-primary" />
              </div>
            </div>
          </div>
        </div>
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          Start Your Learning Journey
        </h2>
        <p className="text-xl text-muted-foreground/90 mb-8 max-w-2xl mx-auto leading-relaxed">
          Master any subject with spaced repetition. Create flashcards, organize them into decks, and let our smart algorithm optimize your learning.
        </p>
      </div>

      {/* Benefits */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="group text-center p-6 rounded-lg bg-card border border-border/50 hover:shadow-md transition-all duration-200 hover:border-primary/20">
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <Brain className="h-7 w-7 text-primary" />
          </div>
          <h3 className="font-semibold mb-3 text-lg">Smart Learning</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">Advanced FSRS algorithm shows you cards precisely when you're about to forget them</p>
        </div>
        <div className="group text-center p-6 rounded-lg bg-card border border-border/50 hover:shadow-md transition-all duration-200 hover:border-accent/30">
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-accent/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <TrendingUp className="h-7 w-7 text-foreground" />
          </div>
          <h3 className="font-semibold mb-3 text-lg">Track Progress</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">Monitor your learning journey with helpful insights</p>
        </div>
        <div className="group text-center p-6 rounded-lg bg-card border border-border/50 hover:shadow-md transition-all duration-200 hover:border-primary/20">
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <Target className="h-7 w-7 text-primary" />
          </div>
          <h3 className="font-semibold mb-3 text-lg">Efficient Study</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">Focus on what matters with personalized schedules</p>
        </div>
      </div>

      {/* Preview */}
      <div className="mb-12">
        <h3 className="text-2xl font-semibold text-center mb-8">See How It Works</h3>
        <div className="max-w-sm mx-auto">
          <div className="group cursor-pointer">
            <div className="relative bg-gradient-to-br from-primary via-primary to-accent text-white p-8 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="text-center space-y-6">
                <div>
                  <p className="text-sm opacity-80 mb-3 uppercase tracking-wide">Question</p>
                  <h4 className="text-xl font-semibold leading-tight">What is the capital of France?</h4>
                </div>
                <div className="border-t border-white/20 pt-6">
                  <p className="text-sm opacity-80 mb-3 uppercase tracking-wide">Answer</p>
                  <p className="text-xl font-medium">Paris</p>
                </div>
              </div>
              <div className="absolute top-4 right-4 opacity-20">
                <Sparkles className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button onClick={onManageDecks} size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-primary/25 transition-all duration-200">
          Create your first cards
        </Button>
      </div>
    </section>
  );
}

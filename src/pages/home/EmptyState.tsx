import { Button } from "@/components/ui/button";
import { GraduationCap, Brain, TrendingUp, Target, Sparkles, ArrowRight, Play, Zap } from "lucide-react";

interface EmptyStateProps {
  onManageDecks: () => void;
}

export default function EmptyState({ onManageDecks }: EmptyStateProps) {
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute bottom-32 left-1/4 w-16 h-16 bg-gradient-to-br from-primary/30 to-transparent rounded-full blur-lg animate-pulse delay-500" />
      </div>

      <section className="relative max-w-6xl mx-auto px-4 animate-fade-in">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="relative mb-12">
            <div className="relative mx-auto w-48 h-48 mb-8">
              {/* Floating rings */}
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse" />
              <div className="absolute inset-4 rounded-full border-2 border-accent/30 animate-pulse delay-300" />
              <div className="absolute inset-8 rounded-full border border-primary/40 animate-pulse delay-700" />
              
              {/* Central icon */}
              <div className="absolute inset-12 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-2xl">
                  <GraduationCap className="h-10 w-10 text-white" />
                </div>
              </div>
              
              {/* Floating elements */}
              <Sparkles className="absolute -top-4 -right-4 h-8 w-8 text-accent animate-pulse" />
              <Zap className="absolute -bottom-4 -left-4 h-6 w-6 text-primary animate-pulse delay-500" />
            </div>
          </div>
          
          <div className="space-y-6 mb-12">
            <h1 className="text-6xl md:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Learn
              </span>
              <br />
              <span className="text-foreground">Smarter</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Harness the power of spaced repetition to master any subject. 
              <span className="text-primary font-semibold"> Create, study, succeed.</span>
            </p>
          </div>

          {/* CTA Button */}
          <div className="mb-20">
            <Button 
              onClick={onManageDecks} 
              size="lg" 
              className="group relative px-12 py-6 text-lg font-semibold bg-gradient-to-r from-primary via-primary to-accent hover:from-accent hover:via-primary hover:to-primary transition-all duration-500 shadow-2xl hover:shadow-primary/30 transform hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-3">
                Start Your Journey
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/20 to-accent/20 blur-xl group-hover:blur-2xl transition-all duration-300" />
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: Brain,
              title: "AI-Powered Learning",
              description: "Advanced FSRS algorithm adapts to your learning patterns for optimal retention",
              gradient: "from-blue-500/20 to-purple-500/20",
              iconColor: "text-blue-600"
            },
            {
              icon: TrendingUp,
              title: "Progress Tracking",
              description: "Visualize your learning journey with detailed analytics and insights",
              gradient: "from-green-500/20 to-emerald-500/20",
              iconColor: "text-green-600"
            },
            {
              icon: Target,
              title: "Smart Scheduling",
              description: "Study exactly when you need to for maximum efficiency and retention",
              gradient: "from-orange-500/20 to-red-500/20",
              iconColor: "text-orange-600"
            }
          ].map((feature, index) => (
            <div 
              key={feature.title}
              className="group relative p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />
              
              <div className="relative z-10">
                <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Preview Card */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8 text-foreground">Experience the Magic</h2>
          <div className="max-w-md mx-auto">
            <div className="group relative transform hover:scale-105 transition-all duration-500 cursor-pointer">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Card */}
              <div className="relative bg-gradient-to-br from-primary via-primary to-accent text-white p-10 rounded-2xl shadow-2xl">
                <div className="absolute top-4 right-4">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Play className="h-4 w-4 text-white/80" />
                  </div>
                </div>
                
                <div className="text-center space-y-8">
                  <div>
                    <p className="text-sm opacity-70 mb-3 uppercase tracking-widest font-medium">Question</p>
                    <h3 className="text-2xl font-bold leading-tight">What is the capital of France?</h3>
                  </div>
                  
                  <div className="border-t border-white/20 pt-8">
                    <p className="text-sm opacity-70 mb-3 uppercase tracking-widest font-medium">Answer</p>
                    <p className="text-2xl font-semibold">Paris</p>
                  </div>
                </div>
                
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="h-6 w-6 text-white/60 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

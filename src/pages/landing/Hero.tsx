import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Brain, Sparkles, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with Falling Flashcards */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="absolute inset-0 overflow-hidden">
        {/* Falling Flashcards */}
        {[
          { text: "Hola", subject: "Spanish", delay: "0s", color: "bg-red-500/20 border-red-300" },
          { text: "Python", subject: "Programming", delay: "2s", color: "bg-blue-500/20 border-blue-300" },
          { text: "こんにちは", subject: "Japanese", delay: "4s", color: "bg-pink-500/20 border-pink-300" },
          { text: "History", subject: "Studies", delay: "1s", color: "bg-yellow-500/20 border-yellow-300" },
          { text: "Bonjour", subject: "French", delay: "3s", color: "bg-purple-500/20 border-purple-300" },
          { text: "Math", subject: "Calculus", delay: "5s", color: "bg-green-500/20 border-green-300" },
          { text: "Guten Tag", subject: "German", delay: "6s", color: "bg-orange-500/20 border-orange-300" },
          { text: "Chemistry", subject: "Science", delay: "7s", color: "bg-cyan-500/20 border-cyan-300" },
          { text: "Привет", subject: "Russian", delay: "8s", color: "bg-indigo-500/20 border-indigo-300" },
          { text: "Biology", subject: "Life Science", delay: "9s", color: "bg-emerald-500/20 border-emerald-300" },
        ].map((card, index) => (
          <div
            key={index}
            className={`absolute w-32 h-20 ${card.color} backdrop-blur-sm rounded-lg border-2 shadow-lg opacity-70 animate-fall`}
            style={{
              left: `${10 + (index % 5) * 20}%`,
              animationDelay: card.delay,
            }}
          >
            <div className="p-3 h-full flex flex-col justify-between text-center">
              <div className="text-sm font-bold text-foreground">{card.text}</div>
              <div className="text-xs text-muted-foreground">{card.subject}</div>
            </div>
          </div>
        ))}
      </div>
      
      
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">FlashMaster</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/auth")}
              className="text-muted-foreground hover:text-foreground"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate("/auth")}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-6 space-y-4">
          {/* Badge */}
          <Badge variant="secondary" className="mx-auto px-4 py-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 mr-2" />
            Powered by Advanced FSRS Algorithm
          </Badge>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="text-foreground">Master Any Subject with</span>
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Smart Flashcards
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Learn faster and remember longer with scientifically-proven spaced repetition. 
              Our intelligent algorithm adapts to your learning pace.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 h-auto"
            >
              Start Learning for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/auth")}
              className="border-border hover:bg-primary/10 hover:text-primary hover:border-primary/50 text-lg px-8 py-6 h-auto"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              See How It Works
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-16 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">10x</div>
              <div className="text-sm text-muted-foreground">Faster Learning</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">95%</div>
              <div className="text-sm text-muted-foreground">Retention Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">50K+</div>
              <div className="text-sm text-muted-foreground">Happy Students</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 opacity-20">
        <div className="w-20 h-20 bg-primary/30 rounded-full blur-xl animate-pulse" />
      </div>
      <div className="absolute bottom-20 right-10 opacity-20">
        <div className="w-32 h-32 bg-accent/30 rounded-full blur-xl animate-pulse delay-1000" />
      </div>
    </section>
  );
};

export default Hero;
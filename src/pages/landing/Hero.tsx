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
        {/* Static Flashcards */}
        {[
          { text: "Hola", subject: "Spanish", x: "5%", y: "20%", rotate: "-12deg", color: "bg-red-500/30 border-red-400" },
          { text: "Python", subject: "Programming", x: "88%", y: "15%", rotate: "15deg", color: "bg-blue-500/30 border-blue-400" },
          { text: "こんにちは", subject: "Japanese", x: "15%", y: "75%", rotate: "8deg", color: "bg-pink-500/30 border-pink-400" },
          { text: "History", subject: "Studies", x: "78%", y: "80%", rotate: "-18deg", color: "bg-yellow-500/30 border-yellow-400" },
          { text: "Bonjour", subject: "French", x: "25%", y: "45%", rotate: "22deg", color: "bg-purple-500/30 border-purple-400" },
          { text: "Math", subject: "Calculus", x: "72%", y: "35%", rotate: "-8deg", color: "bg-green-500/30 border-green-400" },
          { text: "Guten Tag", subject: "German", x: "35%", y: "85%", rotate: "12deg", color: "bg-orange-500/30 border-orange-400" },
          { text: "Chemistry", subject: "Science", x: "65%", y: "55%", rotate: "-25deg", color: "bg-cyan-500/30 border-cyan-400" },
          { text: "Привет", subject: "Russian", x: "20%", y: "30%", rotate: "18deg", color: "bg-indigo-500/30 border-indigo-400" },
          { text: "Biology", subject: "Life Science", x: "75%", y: "65%", rotate: "-6deg", color: "bg-emerald-500/30 border-emerald-400" },
          { text: "Mandarin", subject: "中文", x: "42%", y: "10%", rotate: "25deg", color: "bg-rose-500/30 border-rose-400" },
          { text: "Physics", subject: "Science", x: "82%", y: "25%", rotate: "-15deg", color: "bg-violet-500/30 border-violet-400" },
          { text: "Ciao", subject: "Italian", x: "30%", y: "55%", rotate: "-20deg", color: "bg-teal-500/30 border-teal-400" },
          { text: "Geografia", subject: "Geography", x: "58%", y: "10%", rotate: "28deg", color: "bg-amber-500/30 border-amber-400" },
          { text: "안녕하세요", subject: "Korean", x: "12%", y: "65%", rotate: "14deg", color: "bg-fuchsia-500/30 border-fuchsia-400" },
          { text: "Literature", subject: "English", x: "68%", y: "45%", rotate: "-22deg", color: "bg-lime-500/30 border-lime-400" },
          { text: "Olá", subject: "Portuguese", x: "38%", y: "25%", rotate: "16deg", color: "bg-sky-500/30 border-sky-400" },
          { text: "Economics", subject: "Business", x: "55%", y: "75%", rotate: "-10deg", color: "bg-red-600/30 border-red-500" },
          { text: "Salaam", subject: "Arabic", x: "18%", y: "40%", rotate: "20deg", color: "bg-purple-600/30 border-purple-500" },
          { text: "Art History", subject: "Arts", x: "62%", y: "30%", rotate: "-16deg", color: "bg-pink-600/30 border-pink-500" },
          { text: "Namaste", subject: "Hindi", x: "8%", y: "80%", rotate: "24deg", color: "bg-orange-600/30 border-orange-500" },
          { text: "Philosophy", subject: "Wisdom", x: "78%", y: "60%", rotate: "-14deg", color: "bg-indigo-600/30 border-indigo-500" },
          { text: "JavaScript", subject: "Web Dev", x: "48%", y: "15%", rotate: "19deg", color: "bg-yellow-600/30 border-yellow-500" },
          { text: "Psychology", subject: "Mind", x: "85%", y: "85%", rotate: "-26deg", color: "bg-green-600/30 border-green-500" },
        ].map((card, index) => (
          <div
            key={index}
            className={`absolute w-32 h-20 ${card.color} backdrop-blur-sm rounded-lg border-2 shadow-lg opacity-70 pointer-events-none`}
            style={{
              left: card.x,
              top: card.y,
              transform: `rotate(${card.rotate})`,
              zIndex: 1,
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
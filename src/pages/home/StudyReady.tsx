import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Zap, Clock, Folder, Flame, Target, Brain, ArrowRight, Sparkles } from "lucide-react";

type Card = {
  id: string;
  front: string;
  deck_name: string;
  folder_name: string;
  due_date: string | null;
};

type DueInfo = {
  status: "new" | "overdue" | "due-today" | "future";
  label: string;
  daysUntilDue?: number;
};

interface StudyReadyProps {
  cards: Card[];
  getDueDateStatus: (due: string | null) => DueInfo;
  onStartStudy: () => void;
}

export default function StudyReady({ cards, getDueDateStatus, onStartStudy }: StudyReadyProps) {
  const newCount = cards.filter((c) => getDueDateStatus(c.due_date).status === "new").length;
  const dueToday = cards.filter((c) => getDueDateStatus(c.due_date).status === "due-today").length;
  const overdue = cards.filter((c) => getDueDateStatus(c.due_date).status === "overdue").length;

  return (
    <div className="relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-32 left-16 w-20 h-20 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-40 right-20 w-24 h-24 bg-gradient-to-br from-accent/30 to-primary/30 rounded-full blur-xl animate-pulse delay-1000" />
      </div>

      <section className="relative space-y-12 animate-fade-in">
        {/* Hero Header */}
        <div className="text-center space-y-8">
          <div className="relative">
            <div className="relative mx-auto w-24 h-24 mb-6">
              {/* Pulsing rings */}
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
              <div className="absolute inset-2 rounded-full border border-accent/40 animate-ping delay-300" />
              
              {/* Central icon */}
              <div className="absolute inset-4 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-xl">
                <Flame className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Time to Study!
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              You have <span className="font-bold text-primary text-2xl">{cards.length}</span> cards ready for review.
              <span className="block mt-2 text-base">Let's boost your knowledge! 🚀</span>
            </p>
          </div>

          {/* Primary CTA */}
          <div className="pt-4">
            <Button 
              onClick={onStartStudy} 
              size="lg" 
              className="group relative px-12 py-6 text-xl font-bold bg-gradient-to-r from-primary via-primary to-accent hover:from-accent hover:via-primary hover:to-primary transition-all duration-500 shadow-2xl hover:shadow-primary/40 transform hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-3">
                <Zap className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                Start Learning
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/30 to-accent/30 blur-xl group-hover:blur-2xl transition-all duration-300" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { 
              count: newCount, 
              label: "New Cards", 
              icon: Sparkles, 
              gradient: "from-blue-500/20 to-purple-500/20",
              textColor: "text-blue-600",
              bgColor: "bg-blue-500/10"
            },
            { 
              count: dueToday, 
              label: "Due Today", 
              icon: Target, 
              gradient: "from-green-500/20 to-emerald-500/20",
              textColor: "text-green-600",
              bgColor: "bg-green-500/10"
            },
            { 
              count: overdue, 
              label: "Overdue", 
              icon: Clock, 
              gradient: "from-red-500/20 to-orange-500/20",
              textColor: "text-red-600",
              bgColor: "bg-red-500/10"
            }
          ].map((stat, index) => (
            <div 
              key={stat.label}
              className="group relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />
              
              <div className="relative z-10 text-center space-y-4">
                <div className={`w-12 h-12 mx-auto rounded-2xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
                <div>
                  <div className={`text-3xl font-bold ${stat.textColor}`}>{stat.count}</div>
                  <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Study Queue */}
        <div className="space-y-8 max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Your Study Queue</h2>
                <p className="text-muted-foreground">Prioritized for optimal learning</p>
              </div>
            </div>
            <Badge variant="secondary" className="px-4 py-2 text-sm font-semibold">
              {cards.length} cards ready
            </Badge>
          </div>

          <div className="space-y-4">
            {cards.slice(0, 6).map((card, index) => {
              const { status, label } = getDueDateStatus(card.due_date);

              return (
                <div 
                  key={card.id} 
                  className="group relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={status === "overdue" ? "destructive" : status === "new" ? "default" : "secondary"}
                          className="text-xs font-semibold"
                        >
                          {status === "new" ? "✨ New" : status === "overdue" ? "⏰ Overdue" : "📅 Due"}
                        </Badge>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Folder className="h-3 w-3" />
                          <span className="font-medium">{card.folder_name}</span>
                          <span className="opacity-50">/</span>
                          <BookOpen className="h-3 w-3" />
                          <span className="font-medium">{card.deck_name}</span>
                        </div>
                      </div>
                      <p className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors truncate">
                        {card.front}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 ml-6">
                      <span className="text-sm text-muted-foreground whitespace-nowrap font-medium bg-muted/50 px-3 py-1 rounded-full">
                        {label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {cards.length > 6 && (
              <div className="text-center pt-4">
                <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 rounded-xl p-4 border border-primary/20">
                  <p className="text-muted-foreground">
                    <span className="font-semibold text-primary">+{cards.length - 6} more cards</span> waiting in your queue
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

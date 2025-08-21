import { Brain, Calendar, BarChart3, Zap, FolderOpen, Smartphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Brain,
    title: "FSRS Smart Scheduling",
    description: "Advanced algorithm that learns how your brain works and schedules reviews at the optimal time for maximum retention."
  },
  {
    icon: FolderOpen,
    title: "Organized Learning",
    description: "Create folders and decks to organize your study material. Keep everything structured and easy to find."
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description: "Detailed analytics show your learning progress, retention rates, and areas that need more attention."
  },
  {
    icon: Calendar,
    title: "Adaptive Reviews",
    description: "Cards are automatically scheduled based on your performance. Difficult cards appear more often."
  },
  {
    icon: Zap,
    title: "Instant Feedback",
    description: "Get immediate feedback on your answers with detailed explanations and progress updates."
  },
  {
    icon: Smartphone,
    title: "Cross-Device Sync",
    description: "Study anywhere, anytime. Your progress syncs seamlessly across all your devices."
  }
];

const Features = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center p-6 space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            Powerful Features for
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Effective Learning</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to transform your study sessions from overwhelming to optimized
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors duration-300">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
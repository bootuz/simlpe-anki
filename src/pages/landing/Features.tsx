import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    emoji: "🧠",
    title: "FSRS Smart Scheduling",
    description: "Advanced algorithm that learns how your brain works and schedules reviews at the optimal time for maximum retention.",
    color: "from-blue-400 to-blue-600"
  },
  {
    emoji: "📁",
    title: "Organized Learning",
    description: "Create folders and decks to organize your study material. Keep everything structured and easy to find.",
    color: "from-green-400 to-green-600"
  },
  {
    emoji: "📊",
    title: "Progress Tracking",
    description: "Detailed analytics show your learning progress, retention rates, and areas that need more attention.",
    color: "from-purple-400 to-purple-600"
  },
  {
    emoji: "📅",
    title: "Adaptive Reviews",
    description: "Cards are automatically scheduled based on your performance. Difficult cards appear more often.",
    color: "from-orange-400 to-orange-600"
  },
  {
    emoji: "⚡",
    title: "Instant Feedback",
    description: "Get immediate feedback on your answers with detailed explanations and progress updates.",
    color: "from-yellow-400 to-yellow-600"
  },
  {
    emoji: "📱",
    title: "Cross-Device Sync",
    description: "Study anywhere, anytime. Your progress syncs seamlessly across all your devices.",
    color: "from-pink-400 to-pink-600"
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
            <Card key={index} className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${feature.color}`} />
              <CardContent className="p-6 space-y-4">
                <div className="text-4xl text-center">{feature.emoji}</div>
                <h3 className="text-xl font-semibold text-foreground text-center">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-center">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
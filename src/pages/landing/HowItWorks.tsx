import { Plus, Brain, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    step: 1,
    icon: Plus,
    title: "Create Your Flashcards",
    description: "Add your study material by creating flashcards with questions and answers. Organize them into decks and folders for easy management.",
    color: "from-primary/20 to-primary/10"
  },
  {
    step: 2,
    icon: Brain,
    title: "Study with Smart Algorithm",
    description: "Our FSRS algorithm analyzes your performance and schedules each card at the perfect moment for optimal memory retention.",
    color: "from-accent/20 to-accent/10"
  },
  {
    step: 3,
    icon: TrendingUp,
    title: "Track Your Progress",
    description: "Watch your knowledge grow with detailed analytics. See your retention rates improve and identify areas for focused study.",
    color: "from-primary/30 to-accent/20"
  }
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Three simple steps to transform your learning experience
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-border to-transparent transform translate-x-6 z-0" />
              )}
              
              <Card className="relative z-10 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group">
                <CardContent className="p-8 text-center">
                  {/* Step Number */}
                  <div className="flex items-center justify-center mb-6">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <step.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-semibold text-foreground mb-4">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-muted-foreground mb-6">
            Ready to experience the power of smart learning?
          </p>
          <div className="inline-flex items-center px-6 py-3 bg-primary/10 rounded-full">
            <div className="flex items-center space-x-2 text-primary font-medium">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span>Start your learning journey today</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
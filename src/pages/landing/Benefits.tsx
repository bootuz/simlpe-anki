import { Clock, Target, Zap, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  {
    icon: Zap,
    title: "Learn 10x Faster",
    description: "Scientific spaced repetition helps you absorb information more efficiently than traditional study methods.",
    stat: "10x",
    statLabel: "Faster Learning"
  },
  {
    icon: Target,
    title: "95% Retention Rate",
    description: "Our algorithm ensures you remember what you learn for the long term, not just until the next test.",
    stat: "95%",
    statLabel: "Long-term Retention"
  },
  {
    icon: Clock,
    title: "Save Hours Daily",
    description: "Spend less time reviewing what you already know and more time learning new material.",
    stat: "3-5h",
    statLabel: "Time Saved Daily"
  },
  {
    icon: Shield,
    title: "Proven by Science",
    description: "Based on decades of cognitive research and the latest FSRS algorithm for optimal memory consolidation.",
    stat: "20+",
    statLabel: "Years of Research"
  }
];

const Benefits = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-muted/20 via-background to-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center p-6 space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            Why Choose
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> FlashMaster?</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of students who have transformed their learning experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group overflow-hidden">
              <CardContent className="p-6 space-y-4 relative">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform duration-500" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors duration-300">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">{benefit.stat}</div>
                      <div className="text-sm text-muted-foreground">{benefit.statLabel}</div>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-semibold text-foreground">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center space-x-8 p-8 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50,000+</div>
              <div className="text-sm text-muted-foreground">Active Students</div>
            </div>
            <div className="w-px h-16 bg-border/50" />
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">2M+</div>
              <div className="text-sm text-muted-foreground">Cards Studied</div>
            </div>
            <div className="w-px h-16 bg-border/50" />
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">4.9/5</div>
              <div className="text-sm text-muted-foreground">User Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
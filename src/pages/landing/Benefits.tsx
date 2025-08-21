import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  {
    emoji: "⚡",
    title: "Learn 10x Faster",
    description: "Scientific spaced repetition helps you absorb information more efficiently than traditional study methods.",
    stat: "10x",
    statLabel: "Faster Learning",
    color: "from-yellow-400 to-orange-500"
  },
  {
    emoji: "🎯",
    title: "95% Retention Rate",
    description: "Our algorithm ensures you remember what you learn for the long term, not just until the next test.",
    stat: "95%",
    statLabel: "Long-term Retention",
    color: "from-red-400 to-red-600"
  },
  {
    emoji: "⏰",
    title: "Save Hours Daily",
    description: "Spend less time reviewing what you already know and more time learning new material.",
    stat: "3-5h",
    statLabel: "Time Saved Daily",
    color: "from-blue-400 to-blue-600"
  },
  {
    emoji: "🛡️",
    title: "Proven by Science",
    description: "Based on decades of cognitive research and the latest FSRS algorithm for optimal memory consolidation.",
    stat: "20+",
    statLabel: "Years of Research",
    color: "from-green-400 to-green-600"
  }
];

const Benefits = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-muted/20 via-background to-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center p-6 space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            Why Choose
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Simple Anki?</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of students who have transformed their learning experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${benefit.color}`} />
              <CardContent className="p-6 space-y-4 relative">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform duration-500" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="text-4xl">{benefit.emoji}</div>
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
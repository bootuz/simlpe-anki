import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Medical Student",
    content: "FlashMaster completely transformed how I study anatomy. The spaced repetition helped me retain complex information effortlessly. I went from struggling with memorization to acing my exams.",
    rating: 5,
    avatar: "SC",
    color: "from-pink-400 to-rose-500"
  },
  {
    name: "Marcus Johnson",
    role: "Language Learner", 
    content: "Learning Japanese has never been easier. The smart scheduling means I review vocabulary right when I'm about to forget it. My retention rate has improved dramatically.",
    rating: 5,
    avatar: "MJ",
    color: "from-blue-400 to-cyan-500"
  },
  {
    name: "Emma Rodriguez",
    role: "High School Student",
    content: "I was spending hours reviewing notes with little progress. FlashMaster's algorithm showed me exactly what to study and when. Now I spend less time studying but remember more.",
    rating: 5,
    avatar: "ER",
    color: "from-green-400 to-emerald-500"
  },
  {
    name: "Dr. David Park",
    role: "Professor",
    content: "I recommend FlashMaster to all my students. The scientific approach to spaced repetition is exactly what modern education needs. The results speak for themselves.",
    rating: 5,
    avatar: "DP",
    color: "from-purple-400 to-violet-500"
  },
  {
    name: "Lisa Thompson",
    role: "Professional Exam Prep",
    content: "Preparing for the CPA exam was overwhelming until I found FlashMaster. The intelligent scheduling kept me focused on what mattered most. I passed on my first try!",
    rating: 5,
    avatar: "LT",
    color: "from-orange-400 to-red-500"
  },
  {
    name: "Alex Kim",
    role: "Graduate Student",
    content: "Research papers, complex theories, technical terms - FlashMaster helps me organize and retain everything. It's like having a personal study coach that never sleeps.",
    rating: 5,
    avatar: "AK",
    color: "from-teal-400 to-blue-500"
  }
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center p-6 space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            Loved by Students
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Worldwide</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Don't just take our word for it - hear from students who've transformed their learning
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${testimonial.color}`} />
              <CardContent className="p-6 space-y-4 relative">
                {/* Quote Icon */}
                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                  <Quote className="h-8 w-8 text-primary" />
                </div>

                {/* Stars */}
                <div className="flex items-center justify-center space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-muted-foreground leading-relaxed italic text-center">
                  "{testimonial.content}"
                </p>

                <div className="pt-4 border-t space-y-2">
                  {/* Author */}
                  <div className="flex items-center justify-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {testimonial.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center space-x-2 text-lg font-medium text-primary mb-4">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-primary text-primary" />
              ))}
            </div>
            <span>4.9/5 Average Rating</span>
          </div>
          <p className="text-muted-foreground">
            Based on 10,000+ reviews from students worldwide
          </p>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
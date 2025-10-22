import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Check, ArrowRight } from "lucide-react";

interface EmptyStateProps {
  onManageDecks: () => void;
}

const quickStartTemplates = [
  {
    id: 'vocabulary',
    name: 'Vocabulary Builder',
    emoji: '📖',
    color: 'from-blue-400 to-blue-600',
    description: 'Perfect for learning new words in any language',
  },
  {
    id: 'facts',
    name: 'Quick Facts',
    emoji: '💡',
    color: 'from-yellow-400 to-orange-500',
    description: 'Remember important facts and figures',
  },
  {
    id: 'concepts',
    name: 'Concept Master',
    emoji: '🧠',
    color: 'from-purple-400 to-pink-500',
    description: 'Understand and remember complex ideas',
  }
];

export default function EmptyState({ onManageDecks }: EmptyStateProps) {
  return (
    <div className="text-center space-y-8 p-6">
      {/* Animated Welcome Header */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse" />
        </div>
        <div className="relative space-y-4">
          <h1 className="text-5xl font-bold">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Welcome to Learning!
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Let's start simple. Choose what you'd like to learn, and we'll help you create your first flashcards.
          </p>
        </div>
      </div>
      
      {/* Quick Start Templates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {quickStartTemplates.map((template) => (
          <Card 
            key={template.id}
            className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
            onClick={onManageDecks}
          >
            <div className={`h-2 bg-gradient-to-r ${template.color}`} />
            <CardContent className="p-6 space-y-4">
              <div className="text-5xl text-center mb-4">{template.emoji}</div>
              <h3 className="text-xl font-bold text-center">{template.name}</h3>
              <p className="text-sm text-muted-foreground text-center">
                {template.description}
              </p>
              <div className="pt-4 border-t space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">QUICK START INCLUDES:</p>
                <ul className="text-xs space-y-1">
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-green-500" />
                    <span>Sample cards to get started</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-green-500" />
                    <span>Best practice tips</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-green-500" />
                    <span>Optimized study schedule</span>
                  </li>
                </ul>
              </div>
              <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                Start Learning
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Skip Templates Option */}
      <div className="flex items-center justify-center gap-4">
        <div className="h-px bg-border flex-1 max-w-xs" />
        <span className="text-sm text-muted-foreground">or</span>
        <div className="h-px bg-border flex-1 max-w-xs" />
      </div>
      
      <Button variant="outline" size="lg" className="mx-auto" onClick={onManageDecks}>
        <Plus className="h-5 w-5 mr-2" />
        Create My Own Deck
      </Button>
    </div>
  );
}

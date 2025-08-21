import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  BookOpen, 
  ArrowRight, 
  Sparkles, 
  Brain, 
  Target,
  Trophy,
  ChevronLeft,
  Check,
  Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OnboardingProps {
  onComplete: () => void;
}

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Simple Anki! 🎉',
    description: 'Let\'s get you started on your learning journey in just 3 simple steps.',
    icon: <Sparkles className="h-8 w-8" />
  },
  {
    id: 'goal',
    title: 'What would you like to learn?',
    description: 'This helps us personalize your experience.',
    icon: <Target className="h-8 w-8" />
  },
  {
    id: 'firstDeck',
    title: 'Create your first deck',
    description: 'A deck is a collection of flashcards on a topic.',
    icon: <BookOpen className="h-8 w-8" />
  },
  {
    id: 'firstCard',
    title: 'Add your first flashcard',
    description: 'Flashcards have a question on one side and answer on the other.',
    icon: <Brain className="h-8 w-8" />
  }
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [learningGoal, setLearningGoal] = useState('');
  const [deckName, setDeckName] = useState('');
  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user || !deckName || !cardFront || !cardBack) return;

    setIsCreating(true);
    try {
      // Create a default folder
      const { data: folderData, error: folderError } = await supabase
        .from('folders')
        .insert({
          name: 'My Learning',
          user_id: user.id
        })
        .select()
        .single();

      if (folderError) throw folderError;

      // Create the deck
      const { data: deckData, error: deckError } = await supabase
        .from('decks')
        .insert({
          name: deckName,
          folder_id: folderData.id,
          user_id: user.id
        })
        .select()
        .single();

      if (deckError) throw deckError;

      // Create the first card
      const { error: cardError } = await supabase
        .from('cards')
        .insert({
          front: cardFront,
          back: cardBack,
          deck_id: deckData.id,
          user_id: user.id
        });

      if (cardError) throw cardError;

      // Update profile with learning goal and mark onboarding as complete
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          learning_goal: learningGoal 
        } as any)
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        // Don't throw here as the main functionality (creating content) worked
      }

      toast({
        title: 'Welcome aboard! 🎉',
        description: 'You\'ve successfully created your first deck and card!',
      });

      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete setup. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                {currentStepData.icon}
              </div>
              <div>
                <CardTitle>{currentStepData.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Step {currentStep + 1} of {ONBOARDING_STEPS.length}
                </p>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary to-accent rounded-full h-2 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-muted-foreground">{currentStepData.description}</p>

          {/* Step Content */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <h3 className="font-semibold">Learn Faster</h3>
                  <p className="text-sm text-muted-foreground">
                    Science-backed spaced repetition
                  </p>
                </div>
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <Brain className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <h3 className="font-semibold">Remember More</h3>
                  <p className="text-sm text-muted-foreground">
                    Optimize your memory retention
                  </p>
                </div>
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <h3 className="font-semibold">Track Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    See your improvement over time
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <Label htmlFor="goal">What's your learning goal?</Label>
              <Input
                id="goal"
                placeholder="e.g., Learn Spanish, Study for Biology exam, Master programming..."
                value={learningGoal}
                onChange={(e) => setLearningGoal(e.target.value)}
                className="text-lg"
              />
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLearningGoal('Learn a new language')}
                >
                  🌍 Language
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLearningGoal('Study for school')}
                >
                  📚 School
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLearningGoal('Professional development')}
                >
                  💼 Work
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLearningGoal('Personal interest')}
                >
                  ✨ Hobby
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <Label htmlFor="deck">Name your first deck</Label>
              <Input
                id="deck"
                placeholder="e.g., Spanish Vocabulary, Biology Chapter 1..."
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                className="text-lg"
              />
              <p className="text-sm text-muted-foreground">
                💡 Tip: Start with a specific topic. You can always create more decks later!
              </p>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="front">Question / Front of card</Label>
                  <Input
                    id="front"
                    placeholder="e.g., What is the capital of France?"
                    value={cardFront}
                    onChange={(e) => setCardFront(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="back">Answer / Back of card</Label>
                  <Input
                    id="back"
                    placeholder="e.g., Paris"
                    value={cardBack}
                    onChange={(e) => setCardBack(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg">
                <p className="text-sm">
                  <span className="font-semibold">Great start!</span> You can add more cards after completing the setup.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            {currentStep > 0 ? (
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep === ONBOARDING_STEPS.length - 1 ? (
              <Button 
                onClick={handleComplete}
                disabled={!deckName || !cardFront || !cardBack || isCreating}
              >
                {isCreating ? 'Creating...' : 'Complete Setup'}
                <Check className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
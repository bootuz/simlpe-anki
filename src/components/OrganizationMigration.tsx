import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowRight, 
  Folder, 
  Layers, 
  Info, 
  Check, 
  ChevronRight,
  Brain,
  Sparkles,
  Target,
  TrendingUp
} from 'lucide-react';

// ============================================
// ORGANIZATION MIGRATION WIZARD
// ============================================

interface MigrationSuggestion {
  type: 'split' | 'group' | 'categorize' | 'maintain';
  reason: string;
  suggestedStructure: {
    folders?: string[];
    decks?: Array<{ name: string; cardCount: number }>;
    categories?: string[];
  };
}

export const OrganizationMigrationWizard: React.FC<{
  currentDecks: Array<{ id: string; name: string; cardCount: number }>;
  onComplete: (newStructure: any) => void;
  onSkip: () => void;
}> = ({ currentDecks, onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  // Analyze current structure and suggest improvements
  const analyzeDeckStructure = (): MigrationSuggestion => {
    const totalCards = currentDecks.reduce((sum, deck) => sum + deck.cardCount, 0);
    const avgCardsPerDeck = totalCards / currentDecks.length;
    
    // Deck is too large - suggest splitting
    if (currentDecks.some(deck => deck.cardCount > 100)) {
      return {
        type: 'split',
        reason: 'Some of your decks have grown quite large. Splitting them can improve focus and retention.',
        suggestedStructure: {
          folders: ['Core Concepts', 'Advanced Topics', 'Practice'],
          decks: currentDecks.flatMap(deck => {
            if (deck.cardCount > 100) {
              return [
                { name: `${deck.name} - Basics`, cardCount: Math.floor(deck.cardCount * 0.4) },
                { name: `${deck.name} - Intermediate`, cardCount: Math.floor(deck.cardCount * 0.4) },
                { name: `${deck.name} - Advanced`, cardCount: Math.floor(deck.cardCount * 0.2) }
              ];
            }
            return deck;
          })
        }
      };
    }
    
    // Too many small decks - suggest grouping
    if (currentDecks.length > 5 && avgCardsPerDeck < 20) {
      return {
        type: 'group',
        reason: 'You have many small decks. Grouping related ones can simplify your study routine.',
        suggestedStructure: {
          folders: ['Main Topics', 'Quick Review'],
          decks: [
            { name: 'Combined Vocabulary', cardCount: totalCards * 0.5 },
            { name: 'Key Concepts', cardCount: totalCards * 0.3 },
            { name: 'Practice Questions', cardCount: totalCards * 0.2 }
          ]
        }
      };
    }
    
    // Good structure but could use categories
    if (currentDecks.length >= 3 && currentDecks.length <= 10) {
      return {
        type: 'categorize',
        reason: 'Your deck structure looks good! Adding categories can help with targeted study sessions.',
        suggestedStructure: {
          categories: ['Must Know', 'Important', 'Good to Know', 'Extra Practice']
        }
      };
    }
    
    // Structure is already optimal
    return {
      type: 'maintain',
      reason: 'Your current organization looks great! Keep doing what you\'re doing.',
      suggestedStructure: {}
    };
  };
  
  const suggestion = analyzeDeckStructure();
  
  const steps = [
    {
      title: 'Review Current Structure',
      description: 'Let\'s look at how your decks are organized',
      component: <CurrentStructureReview decks={currentDecks} />
    },
    {
      title: 'Optimization Suggestion',
      description: 'Based on your usage, here\'s what we recommend',
      component: <SuggestionDisplay suggestion={suggestion} />
    },
    {
      title: 'Choose Your Path',
      description: 'Select how you\'d like to proceed',
      component: <MigrationOptions 
        suggestion={suggestion}
        onSelect={setSelectedOption}
        selected={selectedOption}
      />
    },
    {
      title: 'Preview & Confirm',
      description: 'Review your new organization',
      component: <MigrationPreview 
        suggestion={suggestion}
        selectedOption={selectedOption}
      />
    }
  ];
  
  const currentStepData = steps[currentStep];
  
  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          Organization Assistant
        </CardTitle>
        <CardDescription>
          Let's optimize how your flashcards are organized for better learning
        </CardDescription>
        
        {/* Progress Bar */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <Progress value={((currentStep + 1) / steps.length) * 100} />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Step Title */}
        <div>
          <h3 className="text-lg font-semibold">{currentStepData.title}</h3>
          <p className="text-sm text-muted-foreground">{currentStepData.description}</p>
        </div>
        
        {/* Step Content */}
        <div className="min-h-[300px]">
          {currentStepData.component}
        </div>
        
        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t">
          {currentStep === 0 ? (
            <Button variant="outline" onClick={onSkip}>
              Skip for now
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Back
            </Button>
          )}
          
          {currentStep === steps.length - 1 ? (
            <Button 
              onClick={() => onComplete(selectedOption)}
              disabled={!selectedOption}
            >
              Apply Changes
              <Check className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={currentStep === 2 && !selectedOption}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// STEP COMPONENTS
// ============================================

const CurrentStructureReview: React.FC<{ decks: any[] }> = ({ decks }) => {
  const totalCards = decks.reduce((sum, deck) => sum + deck.cardCount, 0);
  const avgCards = Math.round(totalCards / decks.length);
  
  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Layers className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{decks.length}</p>
            <p className="text-sm text-muted-foreground">Total Decks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{totalCards}</p>
            <p className="text-sm text-muted-foreground">Total Cards</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{avgCards}</p>
            <p className="text-sm text-muted-foreground">Avg per Deck</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Deck List */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-muted-foreground">YOUR CURRENT DECKS:</p>
        {decks.map((deck, index) => (
          <div 
            key={deck.id} 
            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">{index + 1}</span>
              </div>
              <span className="font-medium">{deck.name}</span>
            </div>
            <span className="text-sm text-muted-foreground">{deck.cardCount} cards</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SuggestionDisplay: React.FC<{ suggestion: MigrationSuggestion }> = ({ suggestion }) => {
  const getIcon = () => {
    switch (suggestion.type) {
      case 'split': return <Layers className="h-6 w-6" />;
      case 'group': return <Folder className="h-6 w-6" />;
      case 'categorize': return <Sparkles className="h-6 w-6" />;
      default: return <Check className="h-6 w-6" />;
    }
  };
  
  const getTitle = () => {
    switch (suggestion.type) {
      case 'split': return 'Split Large Decks';
      case 'group': return 'Combine Small Decks';
      case 'categorize': return 'Add Categories';
      default: return 'Keep Current Structure';
    }
  };
  
  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>{suggestion.reason}</AlertDescription>
      </Alert>
      
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
              {getIcon()}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg mb-2">{getTitle()}</h4>
              
              {suggestion.suggestedStructure.folders && (
                <div className="space-y-2 mt-4">
                  <p className="text-sm font-medium text-muted-foreground">SUGGESTED FOLDERS:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestion.suggestedStructure.folders.map((folder) => (
                      <div key={folder} className="px-3 py-1 bg-background rounded-md border">
                        <Folder className="h-3 w-3 inline mr-1" />
                        {folder}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {suggestion.suggestedStructure.decks && (
                <div className="space-y-2 mt-4">
                  <p className="text-sm font-medium text-muted-foreground">NEW DECK STRUCTURE:</p>
                  <div className="space-y-1">
                    {suggestion.suggestedStructure.decks.map((deck) => (
                      <div key={deck.name} className="flex justify-between text-sm">
                        <span>{deck.name}</span>
                        <span className="text-muted-foreground">~{deck.cardCount} cards</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {suggestion.suggestedStructure.categories && (
                <div className="space-y-2 mt-4">
                  <p className="text-sm font-medium text-muted-foreground">ADD CATEGORIES:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestion.suggestedStructure.categories.map((category) => (
                      <div key={category} className="px-3 py-1 bg-background rounded-full text-sm">
                        {category}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const MigrationOptions: React.FC<{
  suggestion: MigrationSuggestion;
  onSelect: (option: string) => void;
  selected: string | null;
}> = ({ suggestion, onSelect, selected }) => {
  const options = [
    {
      id: 'automatic',
      title: 'Automatic Organization',
      description: 'Let us reorganize your decks based on our recommendation',
      icon: <Brain className="h-5 w-5" />,
      recommended: true
    },
    {
      id: 'guided',
      title: 'Guided Setup',
      description: 'We\'ll walk you through organizing step by step',
      icon: <ChevronRight className="h-5 w-5" />
    },
    {
      id: 'manual',
      title: 'Manual Control',
      description: 'Full control - organize everything yourself',
      icon: <Layers className="h-5 w-5" />
    },
    {
      id: 'skip',
      title: 'Keep Current',
      description: 'Stay with your current organization',
      icon: <Check className="h-5 w-5" />
    }
  ];
  
  return (
    <div className="space-y-3">
      {options.map((option) => (
        <Card 
          key={option.id}
          className={`cursor-pointer transition-all ${
            selected === option.id 
              ? 'border-primary shadow-md' 
              : 'hover:border-primary/50'
          }`}
          onClick={() => onSelect(option.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                selected === option.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}>
                {option.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{option.title}</h4>
                  {option.recommended && (
                    <Badge variant="secondary" className="text-xs">Recommended</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {option.description}
                </p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selected === option.id 
                  ? 'border-primary bg-primary' 
                  : 'border-muted-foreground/30'
              }`}>
                {selected === option.id && (
                  <Check className="h-3 w-3 text-primary-foreground" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const MigrationPreview: React.FC<{
  suggestion: MigrationSuggestion;
  selectedOption: string | null;
}> = ({ suggestion, selectedOption }) => {
  if (!selectedOption) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        Please select an option to continue
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <Alert className="border-green-200 bg-green-50">
        <Check className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Your new organization will be applied. You can always change it later.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-4">
        <div className="p-4 bg-muted/30 rounded-lg">
          <h4 className="font-semibold mb-3">What will happen:</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                <span className="text-xs">1</span>
              </div>
              <span>Your cards will be reorganized into the new structure</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                <span className="text-xs">2</span>
              </div>
              <span>Study progress and statistics will be preserved</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                <span className="text-xs">3</span>
              </div>
              <span>You can undo these changes within 7 days</span>
            </li>
          </ul>
        </div>
        
        {selectedOption === 'automatic' && suggestion.suggestedStructure.folders && (
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-3">Your New Structure:</h4>
            <div className="space-y-2">
              {suggestion.suggestedStructure.folders.map((folder) => (
                <div key={folder} className="ml-4">
                  <Folder className="h-4 w-4 inline mr-2 text-primary" />
                  {folder}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationMigrationWizard;
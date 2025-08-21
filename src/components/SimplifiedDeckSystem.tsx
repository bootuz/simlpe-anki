import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Plus, 
  Brain, 
  Trophy, 
  Zap, 
  Sparkles,
  ArrowRight,
  Check,
  Clock,
  TrendingUp,
  Star
} from 'lucide-react';

// ============================================
// SIMPLIFIED DATA MODELS FOR BEGINNERS
// ============================================

interface SimpleDeck {
  id: string;
  name: string;
  emoji: string;
  color: string;
  cardCount: number;
  dueCount: number;
  streak: number;
  lastStudied?: Date;
  category?: string; // Optional - only shown to intermediate users
}

interface QuickStartTemplate {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
  sampleCards: Array<{
    front: string;
    back: string;
  }>;
  tips: string[];
}

// ============================================
// BEGINNER-FRIENDLY DECK SELECTOR
// ============================================

export const SimplifiedDeckSelector: React.FC = () => {
  const [userLevel, setUserLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [decks, setDecks] = useState<SimpleDeck[]>([]);
  const [showCreateFlow, setShowCreateFlow] = useState(false);
  
  // Quick start templates for absolute beginners
  const quickStartTemplates: QuickStartTemplate[] = [
    {
      id: 'vocabulary',
      name: 'Vocabulary Builder',
      emoji: '📖',
      color: 'from-blue-400 to-blue-600',
      description: 'Perfect for learning new words in any language',
      sampleCards: [
        { front: 'Serendipity', back: 'Finding something good without looking for it' },
        { front: 'Ephemeral', back: 'Lasting for a very short time' }
      ],
      tips: [
        'Add 5-10 new words daily',
        'Include example sentences',
        'Review every morning'
      ]
    },
    {
      id: 'facts',
      name: 'Quick Facts',
      emoji: '💡',
      color: 'from-yellow-400 to-orange-500',
      description: 'Remember important facts and figures',
      sampleCards: [
        { front: 'Speed of light', back: '299,792,458 meters per second' },
        { front: 'Year Columbus sailed', back: '1492' }
      ],
      tips: [
        'Keep answers short and precise',
        'Group related facts together',
        'Use mnemonics when possible'
      ]
    },
    {
      id: 'concepts',
      name: 'Concept Master',
      emoji: '🧠',
      color: 'from-purple-400 to-pink-500',
      description: 'Understand and remember complex ideas',
      sampleCards: [
        { front: 'What is photosynthesis?', back: 'Process where plants convert light energy into chemical energy' },
        { front: 'Define democracy', back: 'System of government where power is vested in the people' }
      ],
      tips: [
        'Break complex ideas into parts',
        'Use your own words',
        'Connect to what you already know'
      ]
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Beginner Welcome Section */}
      {decks.length === 0 && userLevel === 'beginner' && (
        <BeginnerWelcome onTemplateSelect={handleTemplateSelect} templates={quickStartTemplates} />
      )}
      
      {/* Simplified Deck Grid */}
      {decks.length > 0 && (
        <SimpleDeckGrid 
          decks={decks} 
          userLevel={userLevel}
          onDeckSelect={handleDeckSelect}
          onCreateNew={() => setShowCreateFlow(true)}
        />
      )}
      
      {/* Create Flow Modal */}
      {showCreateFlow && (
        <SimplifiedCreateFlow 
          userLevel={userLevel}
          onComplete={handleCreateComplete}
          onClose={() => setShowCreateFlow(false)}
        />
      )}
    </div>
  );
  
  function handleTemplateSelect(template: QuickStartTemplate) {
    // Create deck from template with pre-populated cards
    console.log('Creating deck from template:', template);
  }
  
  function handleDeckSelect(deck: SimpleDeck) {
    // Navigate to study or manage view
    console.log('Selected deck:', deck);
  }
  
  function handleCreateComplete(newDeck: SimpleDeck) {
    setDecks([...decks, newDeck]);
    setShowCreateFlow(false);
  }
};

// ============================================
// BEGINNER WELCOME COMPONENT
// ============================================

const BeginnerWelcome: React.FC<{
  templates: QuickStartTemplate[];
  onTemplateSelect: (template: QuickStartTemplate) => void;
}> = ({ templates, onTemplateSelect }) => {
  return (
    <div className="text-center space-y-8">
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
        {templates.map((template) => (
          <Card 
            key={template.id}
            className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
            onClick={() => onTemplateSelect(template)}
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
      
      <Button variant="outline" size="lg" className="mx-auto">
        <Plus className="h-5 w-5 mr-2" />
        Create My Own Deck
      </Button>
    </div>
  );
};

// ============================================
// SIMPLIFIED DECK GRID
// ============================================

const SimpleDeckGrid: React.FC<{
  decks: SimpleDeck[];
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  onDeckSelect: (deck: SimpleDeck) => void;
  onCreateNew: () => void;
}> = ({ decks, userLevel, onDeckSelect, onCreateNew }) => {
  // Group decks by category for intermediate users
  const groupedDecks = userLevel !== 'beginner' 
    ? decks.reduce((acc, deck) => {
        const category = deck.category || 'Uncategorized';
        if (!acc[category]) acc[category] = [];
        acc[category].push(deck);
        return acc;
      }, {} as Record<string, SimpleDeck[]>)
    : { 'All Decks': decks };
  
  return (
    <div className="space-y-8">
      {/* Study Stats Banner - Motivational for beginners */}
      {userLevel === 'beginner' && (
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <p className="text-2xl font-bold">7</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
              <div>
                <Brain className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <p className="text-2xl font-bold">142</p>
                <p className="text-sm text-muted-foreground">Cards Learned</p>
              </div>
              <div>
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">89%</p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Deck Categories */}
      {Object.entries(groupedDecks).map(([category, categoryDecks]) => (
        <div key={category} className="space-y-4">
          {userLevel !== 'beginner' && (
            <h2 className="text-lg font-semibold text-muted-foreground">{category}</h2>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryDecks.map((deck) => (
              <DeckCard 
                key={deck.id} 
                deck={deck} 
                onClick={() => onDeckSelect(deck)}
                userLevel={userLevel}
              />
            ))}
            
            {/* Add New Deck Card */}
            <Card 
              className="group cursor-pointer border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-all duration-300"
              onClick={onCreateNew}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px] text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors mb-4">
                  <Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                  Create New Deck
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {userLevel === 'beginner' 
                    ? 'Add your own flashcards'
                    : 'Organize a new topic'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================
// INDIVIDUAL DECK CARD
// ============================================

const DeckCard: React.FC<{
  deck: SimpleDeck;
  onClick: () => void;
  userLevel: 'beginner' | 'intermediate' | 'advanced';
}> = ({ deck, onClick, userLevel }) => {
  const getDueStatus = () => {
    if (deck.dueCount === 0) {
      return { text: 'All done!', color: 'text-green-500', icon: Check };
    } else if (deck.dueCount <= 5) {
      return { text: `${deck.dueCount} cards due`, color: 'text-blue-500', icon: Clock };
    } else {
      return { text: `${deck.dueCount} cards due`, color: 'text-orange-500', icon: Zap };
    }
  };
  
  const dueStatus = getDueStatus();
  
  return (
    <Card 
      className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-102 overflow-hidden"
      onClick={onClick}
    >
      {/* Color bar */}
      <div className={`h-1 bg-gradient-to-r ${deck.color}`} />
      
      <CardContent className="p-6 space-y-4">
        {/* Deck Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{deck.emoji}</span>
            <div>
              <h3 className="font-bold text-lg">{deck.name}</h3>
              {userLevel !== 'beginner' && deck.category && (
                <p className="text-xs text-muted-foreground">{deck.category}</p>
              )}
            </div>
          </div>
          {deck.streak > 0 && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
              {deck.streak} 🔥
            </Badge>
          )}
        </div>
        
        {/* Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total cards</span>
            <span className="font-semibold">{deck.cardCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Ready to study</span>
            <span className={`font-semibold flex items-center gap-1 ${dueStatus.color}`}>
              <dueStatus.icon className="h-3 w-3" />
              {dueStatus.text}
            </span>
          </div>
        </div>
        
        {/* Study Button */}
        {deck.dueCount > 0 && (
          <Button className="w-full" size="sm">
            Study Now
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
        
        {/* Last Studied - Only for intermediate+ */}
        {userLevel !== 'beginner' && deck.lastStudied && (
          <p className="text-xs text-muted-foreground text-center">
            Last studied {formatRelativeTime(deck.lastStudied)}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================
// SIMPLIFIED CREATE FLOW
// ============================================

const SimplifiedCreateFlow: React.FC<{
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  onComplete: (deck: SimpleDeck) => void;
  onClose: () => void;
}> = ({ userLevel, onComplete, onClose }) => {
  const [step, setStep] = useState(1);
  const [deckName, setDeckName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('📚');
  const [selectedColor, setSelectedColor] = useState('from-blue-400 to-blue-600');
  
  const suggestedNames = [
    'Spanish Vocabulary',
    'Biology Chapter 1',
    'History Dates',
    'Math Formulas',
    'French Phrases',
    'Chemistry Elements'
  ];
  
  const emojis = ['📚', '🎓', '💡', '🌟', '🚀', '🎯', '💪', '🌈'];
  const colors = [
    'from-blue-400 to-blue-600',
    'from-purple-400 to-pink-500',
    'from-green-400 to-emerald-600',
    'from-orange-400 to-red-500',
    'from-indigo-400 to-purple-600',
    'from-teal-400 to-cyan-600'
  ];
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Create Your Deck</CardTitle>
          {/* Progress indicator for beginners */}
          {userLevel === 'beginner' && (
            <div className="flex gap-2 mt-4">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i}
                  className={`h-1 flex-1 rounded-full ${
                    i <= step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  What do you want to study?
                </label>
                <Input
                  placeholder="e.g., Spanish Vocabulary"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  className="text-lg"
                  autoFocus
                />
                {userLevel === 'beginner' && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-muted-foreground">SUGGESTIONS:</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedNames.map((name) => (
                        <Button
                          key={name}
                          variant="outline"
                          size="sm"
                          onClick={() => setDeckName(name)}
                          className="text-xs"
                        >
                          {name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Choose an icon for your deck
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`text-3xl p-4 rounded-lg border-2 transition-all ${
                        selectedEmoji === emoji
                          ? 'border-primary bg-primary/10'
                          : 'border-muted hover:border-primary/50'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Pick a color theme
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`h-20 rounded-lg bg-gradient-to-r ${color} border-2 transition-all ${
                        selectedColor === color
                          ? 'border-primary scale-105 shadow-lg'
                          : 'border-transparent hover:scale-102'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              {/* Preview */}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">PREVIEW:</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedEmoji}</span>
                  <div>
                    <p className="font-bold">{deckName || 'Your Deck Name'}</p>
                    <div className={`h-1 w-20 bg-gradient-to-r ${selectedColor} rounded-full mt-1`} />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            <Button 
              className="flex-1"
              onClick={() => {
                if (step < 3) {
                  setStep(step + 1);
                } else {
                  onComplete({
                    id: Date.now().toString(),
                    name: deckName,
                    emoji: selectedEmoji,
                    color: selectedColor,
                    cardCount: 0,
                    dueCount: 0,
                    streak: 0
                  });
                }
              }}
              disabled={step === 1 && !deckName.trim()}
            >
              {step === 3 ? 'Create Deck' : 'Next'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            {step === 1 && (
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default SimplifiedDeckSelector;
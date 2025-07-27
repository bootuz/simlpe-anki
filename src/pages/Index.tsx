import { useState } from "react";
import { FlashCard } from "@/components/FlashCard";
import { AddCardForm } from "@/components/AddCardForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";

interface Card {
  id: string;
  front: string;
  back: string;
}

const Index = () => {
  const [cards, setCards] = useState<Card[]>([
    {
      id: "1",
      front: "What is React?",
      back: "A JavaScript library for building user interfaces, particularly web applications with interactive UIs."
    },
    {
      id: "2", 
      front: "What does JSX stand for?",
      back: "JavaScript XML - a syntax extension for JavaScript that allows you to write HTML-like elements in React."
    }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const addCard = (front: string, back: string) => {
    const newCard: Card = {
      id: Date.now().toString(),
      front,
      back
    };
    setCards([...cards, newCard]);
  };

  const deleteCard = (id: string) => {
    setCards(cards.filter(card => card.id !== id));
    if (currentIndex >= cards.length - 1) {
      setCurrentIndex(Math.max(0, cards.length - 2));
    }
  };

  const editCard = (id: string, front: string, back: string) => {
    setCards(cards.map(card => 
      card.id === id ? { ...card, front, back } : card
    ));
  };

  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const showAddForm = currentIndex === cards.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              FlashCards
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Learn and memorize with beautiful, interactive flashcards
          </p>
        </div>

        {/* Stats */}
        <div className="text-center mb-8">
          <p className="text-sm text-muted-foreground">
            {cards.length === 0 ? (
              "No cards yet - create your first one!"
            ) : showAddForm ? (
              `Add a new card to your deck of ${cards.length}`
            ) : (
              `Card ${currentIndex + 1} of ${cards.length}`
            )}
          </p>
        </div>

        {/* Main Card Display */}
        <div className="flex flex-col items-center space-y-6">
          <div className="w-full max-w-md">
            {cards.length === 0 ? (
              <AddCardForm onAdd={addCard} />
            ) : showAddForm ? (
              <AddCardForm onAdd={addCard} />
            ) : (
              <FlashCard
                key={cards[currentIndex].id}
                id={cards[currentIndex].id}
                front={cards[currentIndex].front}
                back={cards[currentIndex].back}
                onDelete={deleteCard}
                onEdit={editCard}
              />
            )}
          </div>

          {/* Navigation */}
          {cards.length > 0 && (
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={prevCard}
                disabled={currentIndex === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex gap-1">
                {cards.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentIndex 
                        ? 'bg-primary scale-125' 
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                  />
                ))}
                <button
                  onClick={() => setCurrentIndex(cards.length)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    showAddForm
                      ? 'bg-primary scale-125' 
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={nextCard}
                disabled={currentIndex >= cards.length}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Quick Add Button */}
          {cards.length > 0 && !showAddForm && (
            <Button
              onClick={() => setCurrentIndex(cards.length)}
              variant="outline"
              className="mt-4"
            >
              Add New Card
            </Button>
          )}
        </div>

        {/* Instructions */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>💡 Click on any card to flip it and reveal the answer</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
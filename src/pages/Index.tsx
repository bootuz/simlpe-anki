import { useState, useEffect } from "react";
import { FlashCard } from "@/components/FlashCard";
import { AddCardForm } from "@/components/AddCardForm";
import { AppSidebar, StudyFolder, Deck } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ChevronLeft, ChevronRight, BookOpen, Folder, Plus } from "lucide-react";

interface Card {
  id: string;
  front: string;
  back: string;
  deckId: string;
}

const Index = () => {
  const [folders, setFolders] = useState<StudyFolder[]>([
    {
      id: "1",
      name: "Programming",
      isExpanded: true,
      decks: [
        {
          id: "1",
          name: "React Basics",
          cardCount: 2
        },
        {
          id: "2", 
          name: "JavaScript ES6",
          cardCount: 0
        }
      ]
    },
    {
      id: "2",
      name: "Language Learning",
      isExpanded: false,
      decks: [
        {
          id: "3",
          name: "Spanish Vocabulary",
          cardCount: 0
        }
      ]
    }
  ]);

  const [cards, setCards] = useState<Card[]>([
    {
      id: "1",
      front: "What is React?",
      back: "A JavaScript library for building user interfaces, particularly web applications with interactive UIs.",
      deckId: "1"
    },
    {
      id: "2", 
      front: "What does JSX stand for?",
      back: "JavaScript XML - a syntax extension for JavaScript that allows you to write HTML-like elements in React.",
      deckId: "1"
    }
  ]);

  const [currentFolderId, setCurrentFolderId] = useState<string>("1");
  const [currentDeckId, setCurrentDeckId] = useState<string>("1");
  const [currentIndex, setCurrentIndex] = useState(0);

  // Get current deck cards
  const currentDeckCards = cards.filter(card => card.deckId === currentDeckId);
  const showAddForm = currentIndex === currentDeckCards.length;

  // Get current deck and folder info
  const currentFolder = folders.find(f => f.id === currentFolderId);
  const currentDeck = currentFolder?.decks.find(d => d.id === currentDeckId);

  // Update card counts
  useEffect(() => {
    setFolders(prev => prev.map(folder => ({
      ...folder,
      decks: folder.decks.map(deck => ({
        ...deck,
        cardCount: cards.filter(card => card.deckId === deck.id).length
      }))
    })));
  }, [cards]);

  const addCard = (front: string, back: string) => {
    const newCard: Card = {
      id: Date.now().toString(),
      front,
      back,
      deckId: currentDeckId
    };
    setCards([...cards, newCard]);
  };

  const deleteCard = (id: string) => {
    setCards(cards.filter(card => card.id !== id));
    if (currentIndex >= currentDeckCards.length - 1) {
      setCurrentIndex(Math.max(0, currentDeckCards.length - 2));
    }
  };

  const editCard = (id: string, front: string, back: string) => {
    setCards(cards.map(card => 
      card.id === id ? { ...card, front, back } : card
    ));
  };

  const nextCard = () => {
    if (currentIndex < currentDeckCards.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Sidebar handlers
  const handleFolderSelect = (folderId: string) => {
    setCurrentFolderId(folderId);
    const folder = folders.find(f => f.id === folderId);
    if (folder && folder.decks.length > 0) {
      setCurrentDeckId(folder.decks[0].id);
      setCurrentIndex(0);
    }
  };

  const handleDeckSelect = (folderId: string, deckId: string) => {
    setCurrentFolderId(folderId);
    setCurrentDeckId(deckId);
    setCurrentIndex(0);
  };

  const handleCreateFolder = (name: string) => {
    const newFolder: StudyFolder = {
      id: Date.now().toString(),
      name,
      decks: [],
      isExpanded: true
    };
    setFolders([...folders, newFolder]);
  };

  const handleCreateDeck = (folderId: string, name: string) => {
    const newDeck: Deck = {
      id: Date.now().toString(),
      name,
      cardCount: 0
    };
    setFolders(folders.map(folder => 
      folder.id === folderId 
        ? { ...folder, decks: [...folder.decks, newDeck] }
        : folder
    ));
  };

  const handleRenameFolder = (folderId: string, name: string) => {
    setFolders(folders.map(folder => 
      folder.id === folderId ? { ...folder, name } : folder
    ));
  };

  const handleRenameDeck = (folderId: string, deckId: string, name: string) => {
    setFolders(folders.map(folder => 
      folder.id === folderId 
        ? {
            ...folder,
            decks: folder.decks.map(deck => 
              deck.id === deckId ? { ...deck, name } : deck
            )
          }
        : folder
    ));
  };

  const handleDeleteFolder = (folderId: string) => {
    // Delete all cards in this folder's decks
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      const deckIds = folder.decks.map(d => d.id);
      setCards(cards.filter(card => !deckIds.includes(card.deckId)));
    }
    
    setFolders(folders.filter(folder => folder.id !== folderId));
    
    // If we deleted the current folder, switch to first available
    if (folderId === currentFolderId) {
      const remainingFolders = folders.filter(f => f.id !== folderId);
      if (remainingFolders.length > 0) {
        setCurrentFolderId(remainingFolders[0].id);
        if (remainingFolders[0].decks.length > 0) {
          setCurrentDeckId(remainingFolders[0].decks[0].id);
        }
      }
    }
  };

  const handleDeleteDeck = (folderId: string, deckId: string) => {
    // Delete all cards in this deck
    setCards(cards.filter(card => card.deckId !== deckId));
    
    setFolders(folders.map(folder => 
      folder.id === folderId 
        ? { ...folder, decks: folder.decks.filter(deck => deck.id !== deckId) }
        : folder
    ));
    
    // If we deleted the current deck, switch to first available in folder
    if (deckId === currentDeckId) {
      const folder = folders.find(f => f.id === folderId);
      if (folder) {
        const remainingDecks = folder.decks.filter(d => d.id !== deckId);
        if (remainingDecks.length > 0) {
          setCurrentDeckId(remainingDecks[0].id);
        }
      }
    }
  };

  const handleToggleFolder = (folderId: string) => {
    setFolders(folders.map(folder => 
      folder.id === folderId 
        ? { ...folder, isExpanded: !folder.isExpanded }
        : folder
    ));
  };

  return (
    <>
      <AppSidebar
        folders={folders}
        currentFolderId={currentFolderId}
        currentDeckId={currentDeckId}
        onFolderSelect={handleFolderSelect}
        onDeckSelect={handleDeckSelect}
        onCreateFolder={handleCreateFolder}
        onCreateDeck={handleCreateDeck}
        onRenameFolder={handleRenameFolder}
        onRenameDeck={handleRenameDeck}
        onDeleteFolder={handleDeleteFolder}
        onDeleteDeck={handleDeleteDeck}
        onToggleFolder={handleToggleFolder}
      />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between h-full px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold">FlashCards</h1>
              </div>
            </div>
            
            {currentFolder && currentDeck && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Folder className="h-4 w-4" />
                <span>{currentFolder.name}</span>
                <span>/</span>
                <BookOpen className="h-4 w-4" />
                <span>{currentDeck.name}</span>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 bg-gradient-to-br from-background via-muted/30 to-accent/10">
          <div className="container mx-auto px-6 py-8">
            {!currentDeck ? (
              <div className="flex flex-col items-center justify-center h-64">
                <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold mb-2">No Deck Selected</h2>
                <p className="text-muted-foreground text-center mb-6">
                  Create a folder and deck to start adding flashcards
                </p>
                <Button onClick={() => handleCreateFolder("My First Folder")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Folder
                </Button>
              </div>
            ) : (
              <>
                {/* Deck Header */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2">{currentDeck.name}</h2>
                  <p className="text-muted-foreground">
                    {currentDeckCards.length === 0 ? (
                      "No cards yet - create your first one!"
                    ) : showAddForm ? (
                      `Add a new card to your deck of ${currentDeckCards.length}`
                    ) : (
                      `Card ${currentIndex + 1} of ${currentDeckCards.length}`
                    )}
                  </p>
                </div>

                {/* Main Card Display */}
                <div className="flex flex-col items-center space-y-6">
                  <div className="w-full max-w-md">
                    {currentDeckCards.length === 0 ? (
                      <AddCardForm onAdd={addCard} />
                    ) : showAddForm ? (
                      <AddCardForm onAdd={addCard} />
                    ) : (
                      <FlashCard
                        key={currentDeckCards[currentIndex].id}
                        id={currentDeckCards[currentIndex].id}
                        front={currentDeckCards[currentIndex].front}
                        back={currentDeckCards[currentIndex].back}
                        onDelete={deleteCard}
                        onEdit={editCard}
                      />
                    )}
                  </div>

                  {/* Navigation */}
                  {currentDeckCards.length > 0 && (
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
                        {currentDeckCards.map((_, index) => (
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
                          onClick={() => setCurrentIndex(currentDeckCards.length)}
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
                        disabled={currentIndex >= currentDeckCards.length}
                        className="flex items-center gap-2"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* Quick Add Button */}
                  {currentDeckCards.length > 0 && !showAddForm && (
                    <Button
                      onClick={() => setCurrentIndex(currentDeckCards.length)}
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
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default Index;
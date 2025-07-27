import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FlashCard } from "@/components/FlashCard";
import { AppSidebar, StudyFolder, Deck } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Folder, 
  Plus, 
  LogOut, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  Trash2,
  CheckSquare
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Card {
  id: string;
  front: string;
  back: string;
  deck_id: string;
  created_at: string;
  updated_at: string;
  state?: string; // FSRS state
  due_date?: string; // FSRS due date
}

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [folders, setFolders] = useState<StudyFolder[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string>("");
  const [currentDeckId, setCurrentDeckId] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Modern UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState<string>("all");
  const [filterDueDate, setFilterDueDate] = useState<string>("all");
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardFront, setNewCardFront] = useState("");
  const [newCardBack, setNewCardBack] = useState("");

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Load data when user is authenticated
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setDataLoading(true);
      
      // Load folders
      const { data: foldersData, error: foldersError } = await supabase
        .from("folders")
        .select("*")
        .order("created_at");

      if (foldersError) throw foldersError;

      // Load decks
      const { data: decksData, error: decksError } = await supabase
        .from("decks")
        .select("*")
        .order("created_at");

      if (decksError) throw decksError;

      // Load cards with FSRS state
      const { data: cardsData, error: cardsError } = await supabase
        .from("cards")
        .select(`
          *,
          card_fsrs!inner (
            state,
            due_date
          )
        `)
        .order("created_at");

      if (cardsError) throw cardsError;

      // Transform data to match component structure
      const transformedFolders: StudyFolder[] = foldersData.map(folder => ({
        id: folder.id,
        name: folder.name,
        isExpanded: true,
        decks: decksData
          .filter(deck => deck.folder_id === folder.id)
          .map(deck => ({
            id: deck.id,
            name: deck.name,
            cardCount: cardsData.filter(card => card.deck_id === deck.id).length
          }))
      }));

      // Transform cards data to include FSRS state
      const transformedCards: Card[] = cardsData.map(card => ({
        id: card.id,
        front: card.front,
        back: card.back,
        deck_id: card.deck_id,
        created_at: card.created_at,
        updated_at: card.updated_at,
        state: card.card_fsrs?.state,
        due_date: card.card_fsrs?.due_date
      }));

      setFolders(transformedFolders);
      setCards(transformedCards);
      
      // Set initial selection
      if (transformedFolders.length > 0) {
        setCurrentFolderId(transformedFolders[0].id);
        if (transformedFolders[0].decks.length > 0) {
          setCurrentDeckId(transformedFolders[0].decks[0].id);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load your data",
        variant: "destructive"
      });
    } finally {
      setDataLoading(false);
    }
  };

  // Get current deck cards
  const currentDeckCards = cards.filter(card => card.deck_id === currentDeckId);

  // Get current deck and folder info
  const currentFolder = folders.find(f => f.id === currentFolderId);
  const currentDeck = currentFolder?.decks.find(d => d.id === currentDeckId);

  const handleAddCard = async () => {
    if (!user || !newCardFront.trim() || !newCardBack.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from("cards")
        .insert({
          front: newCardFront.trim(),
          back: newCardBack.trim(),
          deck_id: currentDeckId,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // The trigger will automatically create FSRS data with 'New' state
      const newCard: Card = {
        ...data,
        state: 'New'
      };

      setCards([...cards, newCard]);
      setNewCardFront("");
      setNewCardBack("");
      setIsAddingCard(false);
      
      toast({
        title: "Success",
        description: "Card added successfully"
      });
    } catch (error) {
      console.error("Error adding card:", error);
      toast({
        title: "Error",
        description: "Failed to add card",
        variant: "destructive"
      });
    }
  };

  const addCard = async (front: string, back: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("cards")
        .insert({
          front,
          back,
          deck_id: currentDeckId,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // The trigger will automatically create FSRS data with 'New' state
      // So we don't need to manually insert it anymore
      const newCard: Card = {
        ...data,
        state: 'New' // New cards will have 'New' state
      };

      setCards([...cards, newCard]);
      toast({
        title: "Success",
        description: "Card added successfully"
      });
    } catch (error) {
      console.error("Error adding card:", error);
      toast({
        title: "Error",
        description: "Failed to add card",
        variant: "destructive"
      });
    }
  };

  const deleteCard = async (id: string) => {
    try {
      // Delete FSRS data first
      await supabase.from("card_fsrs").delete().eq("card_id", id);
      
      const { error } = await supabase
        .from("cards")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setCards(cards.filter(card => card.id !== id));
      toast({
        title: "Success",
        description: "Card deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting card:", error);
      toast({
        title: "Error",
        description: "Failed to delete card",
        variant: "destructive"
      });
    }
  };

  const editCard = async (id: string, front: string, back: string) => {
    try {
      const { error } = await supabase
        .from("cards")
        .update({ front, back })
        .eq("id", id);

      if (error) throw error;

      setCards(cards.map(card => 
        card.id === id ? { ...card, front, back } : card
      ));
      toast({
        title: "Success",
        description: "Card updated successfully"
      });
    } catch (error) {
      console.error("Error updating card:", error);
      toast({
        title: "Error",
        description: "Failed to update card",
        variant: "destructive"
      });
    }
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

  const handleCreateFolder = async (name: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("folders")
        .insert({
          name,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      const newFolder: StudyFolder = {
        id: data.id,
        name: data.name,
        decks: [],
        isExpanded: true
      };
      setFolders([...folders, newFolder]);
      toast({
        title: "Success",
        description: "Folder created successfully"
      });
    } catch (error) {
      console.error("Error creating folder:", error);
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive"
      });
    }
  };

  const handleCreateDeck = async (folderId: string, name: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("decks")
        .insert({
          name,
          folder_id: folderId,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      const newDeck: Deck = {
        id: data.id,
        name: data.name,
        cardCount: 0
      };
      setFolders(folders.map(folder => 
        folder.id === folderId 
          ? { ...folder, decks: [...folder.decks, newDeck] }
          : folder
      ));
      toast({
        title: "Success",
        description: "Deck created successfully"
      });
    } catch (error) {
      console.error("Error creating deck:", error);
      toast({
        title: "Error",
        description: "Failed to create deck",
        variant: "destructive"
      });
    }
  };

  const handleRenameFolder = async (folderId: string, name: string) => {
    try {
      const { error } = await supabase
        .from("folders")
        .update({ name })
        .eq("id", folderId);

      if (error) throw error;

      setFolders(folders.map(folder => 
        folder.id === folderId ? { ...folder, name } : folder
      ));
      toast({
        title: "Success",
        description: "Folder renamed successfully"
      });
    } catch (error) {
      console.error("Error renaming folder:", error);
      toast({
        title: "Error",
        description: "Failed to rename folder",
        variant: "destructive"
      });
    }
  };

  const handleRenameDeck = async (folderId: string, deckId: string, name: string) => {
    try {
      const { error } = await supabase
        .from("decks")
        .update({ name })
        .eq("id", deckId);

      if (error) throw error;

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
      toast({
        title: "Success",
        description: "Deck renamed successfully"
      });
    } catch (error) {
      console.error("Error renaming deck:", error);
      toast({
        title: "Error",
        description: "Failed to rename deck",
        variant: "destructive"
      });
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      // Delete all cards in this folder's decks first
      const folder = folders.find(f => f.id === folderId);
      if (folder) {
        const deckIds = folder.decks.map(d => d.id);
        await supabase.from("cards").delete().in("deck_id", deckIds);
        await supabase.from("decks").delete().eq("folder_id", folderId);
      }
      
      const { error } = await supabase
        .from("folders")
        .delete()
        .eq("id", folderId);

      if (error) throw error;

      setCards(cards.filter(card => {
        const folder = folders.find(f => f.id === folderId);
        if (!folder) return true;
        const deckIds = folder.decks.map(d => d.id);
        return !deckIds.includes(card.deck_id);
      }));
      
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
      
      toast({
        title: "Success",
        description: "Folder deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast({
        title: "Error",
        description: "Failed to delete folder",
        variant: "destructive"
      });
    }
  };

  const handleDeleteDeck = async (folderId: string, deckId: string) => {
    try {
      // Delete all cards in this deck first
      await supabase.from("cards").delete().eq("deck_id", deckId);
      
      const { error } = await supabase
        .from("decks")
        .delete()
        .eq("id", deckId);

      if (error) throw error;

      setCards(cards.filter(card => card.deck_id !== deckId));
      
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
      
      toast({
        title: "Success",
        description: "Deck deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting deck:", error);
      toast({
        title: "Error",
        description: "Failed to delete deck",
        variant: "destructive"
      });
    }
  };

  const handleToggleFolder = (folderId: string) => {
    setFolders(folders.map(folder => 
      folder.id === folderId 
        ? { ...folder, isExpanded: !folder.isExpanded }
        : folder
    ));
  };

  // Modern UI functions
  const filteredCards = currentDeckCards.filter(card => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!card.front.toLowerCase().includes(query) && 
          !card.back.toLowerCase().includes(query)) {
        return false;
      }
    }

    // State filter
    if (filterState !== "all") {
      if (!card.state || card.state.toLowerCase() !== filterState.toLowerCase()) {
        return false;
      }
    }

    // Due date filter
    if (filterDueDate !== "all" && card.due_date) {
      const now = new Date();
      const dueDate = new Date(card.due_date);
      const diffTime = dueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      switch (filterDueDate) {
        case "overdue":
          if (diffDays >= 0) return false;
          break;
        case "today":
          if (diffDays !== 0) return false;
          break;
        case "week":
          if (diffDays < 0 || diffDays > 7) return false;
          break;
        case "month":
          if (diffDays < 0 || diffDays > 30) return false;
          break;
      }
    }

    return true;
  });

  const handleCardSelection = (cardId: string) => {
    const newSelected = new Set(selectedCards);
    if (newSelected.has(cardId)) {
      newSelected.delete(cardId);
    } else {
      newSelected.add(cardId);
    }
    setSelectedCards(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedCards.size === 0) return;
    
    try {
      const cardIds = Array.from(selectedCards);
      
      // Delete FSRS data first
      await supabase.from("card_fsrs").delete().in("card_id", cardIds);
      
      const { error } = await supabase
        .from("cards")
        .delete()
        .in("id", cardIds);

      if (error) throw error;

      setCards(cards.filter(card => !selectedCards.has(card.id)));
      setSelectedCards(new Set());
      
      toast({
        title: "Success",
        description: `${cardIds.length} cards deleted successfully`
      });
    } catch (error) {
      console.error("Error deleting cards:", error);
      toast({
        title: "Error",
        description: "Failed to delete cards",
        variant: "destructive"
      });
    }
  };

  const getStateVariant = (state?: string) => {
    switch (state) {
      case "New": return "default";
      case "Learning": return "secondary";
      case "Review": return "outline";
      case "Relearning": return "destructive";
      default: return "secondary";
    }
  };

  const getStateBadgeColor = (state?: string) => {
    switch (state) {
      case "New": return "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30";
      case "Learning": return "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30";
      case "Review": return "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30";
      case "Relearning": return "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30";
      default: return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
    }
  };

  const getDueDateColor = (dueDate?: string) => {
    if (!dueDate) return "text-muted-foreground";
    
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "text-red-500";
    if (diffDays === 0) return "text-orange-500";
    if (diffDays <= 3) return "text-yellow-500";
    return "text-muted-foreground";
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
                <h1 className="text-xl font-semibold">Simple Anki</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Home
              </Button>
              
              {user && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 bg-gradient-to-br from-background via-muted/30 to-accent/10">
          <div className="container mx-auto px-6 py-8">
            {loading || dataLoading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : !currentDeck ? (
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
                {/* Breadcrumb */}
                {currentFolder && currentDeck && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                    <Folder className="h-4 w-4" />
                    <span>{currentFolder.name}</span>
                    <span>/</span>
                    <BookOpen className="h-4 w-4" />
                    <span>{currentDeck.name}</span>
                  </div>
                )}

                {/* Deck Header */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2">{currentDeck.name}</h2>
                  <p className="text-muted-foreground">
                    Your flashcards collection
                  </p>
                </div>

                {currentDeckCards.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No cards yet</h3>
                    <p className="text-muted-foreground mb-6">Create your first flashcard to start learning</p>
                    <Button 
                      onClick={() => setIsAddingCard(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Your First Card
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Search and Filter Bar */}
                    <div className="bg-card rounded-lg border p-4 mb-6">
                      <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search cards..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-3">
                          <Select value={filterState} onValueChange={setFilterState}>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="State" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All States</SelectItem>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="learning">Learning</SelectItem>
                              <SelectItem value="review">Review</SelectItem>
                              <SelectItem value="relearning">Relearning</SelectItem>
                            </SelectContent>
                          </Select>

                          <Select value={filterDueDate} onValueChange={setFilterDueDate}>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Due Date" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Cards</SelectItem>
                              <SelectItem value="overdue">Overdue</SelectItem>
                              <SelectItem value="today">Due Today</SelectItem>
                              <SelectItem value="week">This Week</SelectItem>
                              <SelectItem value="month">This Month</SelectItem>
                            </SelectContent>
                          </Select>

                        </div>
                      </div>

                    </div>

                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">
                          Cards ({filteredCards.length})
                        </h3>
                        {selectedCards.size > 0 && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDelete}
                            className="flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete ({selectedCards.size})
                          </Button>
                        )}
                      </div>
                    </div>


                    {/* Cards Display */}
                    {filteredCards.length === 0 ? (
                      <div className="text-center py-12">
                        <Filter className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No cards match your filters</h3>
                        <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
                      </div>
                    ) : (
                       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                         {/* Add Card Button/Form - Always first */}
                         {isAddingCard ? (
                           <Card className="transition-all duration-200 border-2 border-primary/50">
                             <CardContent className="p-4">
                               <div className="space-y-3">
                                 <Input
                                   placeholder="Front of card"
                                   value={newCardFront}
                                   onChange={(e) => setNewCardFront(e.target.value)}
                                 />
                                 <Input
                                   placeholder="Back of card"
                                   value={newCardBack}
                                   onChange={(e) => setNewCardBack(e.target.value)}
                                 />
                                 <div className="flex gap-2">
                                   <Button
                                     size="sm"
                                     onClick={handleAddCard}
                                     disabled={!newCardFront.trim() || !newCardBack.trim()}
                                     className="flex-1"
                                   >
                                     Add Card
                                   </Button>
                                   <Button
                                     size="sm"
                                     variant="outline"
                                     onClick={() => {
                                       setIsAddingCard(false);
                                       setNewCardFront("");
                                       setNewCardBack("");
                                     }}
                                   >
                                     Cancel
                                   </Button>
                                 </div>
                               </div>
                             </CardContent>
                           </Card>
                         ) : (
                           <Card 
                             className="transition-all duration-200 hover:shadow-md cursor-pointer border-dashed border-2 hover:border-primary/50"
                             onClick={() => setIsAddingCard(true)}
                           >
                             <CardContent className="p-4 h-full flex flex-col items-center justify-center min-h-[120px]">
                               <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                               <span className="text-sm font-medium text-muted-foreground">Add New Card</span>
                             </CardContent>
                           </Card>
                         )}

                         {/* Existing Cards */}
                         {filteredCards
                           .sort((a, b) => {
                             if (a.due_date && b.due_date) {
                               return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
                             }
                             return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                           })
                           .map((card) => (
                             <Card 
                               key={card.id} 
                               className={`
                                 transition-all duration-200 hover:shadow-md cursor-pointer
                                 ${selectedCards.has(card.id) ? 'ring-2 ring-primary' : ''}
                               `}
                             >
                               <CardContent className="p-4">
                                 <div className="flex items-start justify-between gap-4">
                                   <div className="flex items-start gap-3 flex-1">
                                     <Checkbox
                                       checked={selectedCards.has(card.id)}
                                       onCheckedChange={() => handleCardSelection(card.id)}
                                     />
                                     <div className="flex-1 min-w-0">
                                       <div className="flex items-center gap-2 mb-2">
                                         <h3 className="font-medium text-card-foreground truncate">
                                           {card.front}
                                         </h3>
                                         {card.state && (
                                           <Badge 
                                             variant="secondary"
                                             className={`text-xs ${getStateBadgeColor(card.state)}`}
                                           >
                                             {card.state}
                                           </Badge>
                                         )}
                                       </div>
                                       <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                         {card.back}
                                       </p>
                                       {card.due_date && (
                                         <div className={`text-xs flex items-center gap-1 ${getDueDateColor(card.due_date)}`}>
                                           <Clock className="h-3 w-3" />
                                           Due: {new Date(card.due_date).toLocaleDateString()}
                                         </div>
                                       )}
                                     </div>
                                   </div>
                                   <div className="flex gap-1 flex-shrink-0">
                                     <Button
                                       size="sm"
                                       variant="ghost"
                                       onClick={() => editCard(card.id, card.front, card.back)}
                                     >
                                       Edit
                                     </Button>
                                     <Button
                                       size="sm"
                                       variant="ghost"
                                       onClick={() => deleteCard(card.id)}
                                       className="text-destructive hover:text-destructive"
                                     >
                                       <Trash2 className="h-4 w-4" />
                                     </Button>
                                   </div>
                                 </div>
                               </CardContent>
                             </Card>
                           ))}
                       </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default Index;
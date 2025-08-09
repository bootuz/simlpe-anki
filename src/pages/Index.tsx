import { useState, useEffect } from "react";
import { getDueDateInfo, getDueDateStatusClass } from "@/utils/fsrsUtils";
import { useNavigate } from "react-router-dom";
import { AppSidebar, StudyFolder, Deck } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  BookOpen,
  Folder, 
  Plus, 
  LogOut, 
  Search, 
  Filter, 
  Clock,
  Trash2,
  MoreHorizontal,
  Edit,
  Layers3,
  Sparkles,
  Zap,
  Inbox
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCardMutations } from "@/hooks/useOptimizedQueries";

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
  const { addCard: addCardMutation } = useCardMutations();
  
  const [isGeneratingSampleData, setIsGeneratingSampleData] = useState(false);
  
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
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [newCardFront, setNewCardFront] = useState("");
  const [newCardBack, setNewCardBack] = useState("");
  
  // Sidebar trigger state
  const [triggerNewFolder, setTriggerNewFolder] = useState(false);
  const [triggerNewDeck, setTriggerNewDeck] = useState<string | null>(null);

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
      
      // Get all folders and decks separately to include empty ones
      const [foldersResult, decksResult, cardsResult] = await Promise.all([
        supabase
          .from("folders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at"),
        supabase
          .from("decks")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at"),
        supabase
          .from("cards_with_details")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at")
      ]);

      if (foldersResult.error) throw foldersResult.error;
      if (decksResult.error) throw decksResult.error;
      if (cardsResult.error) throw cardsResult.error;

      const foldersData = foldersResult.data || [];
      const decksData = decksResult.data || [];
      const cardsData = cardsResult.data || [];

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
      const transformedCards: Card[] = (cardsData || []).map(card => ({
        id: card.id,
        front: card.front,
        back: card.back,
        deck_id: card.deck_id,
        created_at: card.created_at,
        updated_at: card.updated_at,
        state: card.state,
        due_date: card.due_date
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
      const result = await addCardMutation.mutateAsync({
        front: newCardFront.trim(),
        back: newCardBack.trim(),
        deckId: currentDeckId
      });

      // Update local state with the new card
      const newCard: Card = {
        ...result,
        state: 'New',
        due_date: null
      };
      setCards([...cards, newCard]);
      
      // Update local UI state
      updateDeckCardCount(currentDeckId, 1);
      setNewCardFront("");
      setNewCardBack("");
      setIsAddCardModalOpen(false);
      
      // Note: addCardMutation already shows success toast and updates Home page cache
    } catch (error) {
      console.error("Error adding card:", error);
      // Note: addCardMutation already shows error toast
    }
  };

  // Helper function to update deck card counts
  const updateDeckCardCount = (deckId: string, change: number) => {
    setFolders(folders.map(folder => ({
      ...folder,
      decks: folder.decks.map(deck => 
        deck.id === deckId 
          ? { ...deck, cardCount: Math.max(0, deck.cardCount + change) }
          : deck
      )
    })));
  };

  const handleGenerateSampleData = async () => {
    if (!user) return;
    
    try {
      setIsGeneratingSampleData(true);
      
      const { error } = await supabase.rpc('generate_english_sample_data', {
        target_user_id: user.id
      });

      if (error) throw error;

      // Reload data to show the new content
      await loadUserData();
      
      toast({
        title: "Success",
        description: "Sample English learning content created! Check your sidebar for the new English folder."
      });
    } catch (error) {
      console.error("Error generating sample data:", error);
      toast({
        title: "Error",
        description: "Failed to generate sample data",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingSampleData(false);
    }
  };


  const deleteCard = async (id: string) => {
    try {
      const cardToDelete = cards.find(card => card.id === id);
      if (!cardToDelete) return;

      // Delete FSRS data first
      await supabase.from("card_fsrs").delete().eq("card_id", id);
      
      const { error } = await supabase
        .from("cards")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setCards(cards.filter(card => card.id !== id));
      updateDeckCardCount(cardToDelete.deck_id, -1); // Update card count
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

    // Due date filter - New cards (NULL due_date) should always be shown
    if (filterDueDate !== "all") {
      if (card.due_date === null) {
        return true; // Always show new cards
      }
      
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
      const cardsToDelete = cards.filter(card => selectedCards.has(card.id));
      
      // Delete FSRS data first
      await supabase.from("card_fsrs").delete().in("card_id", cardIds);
      
      const { error } = await supabase
        .from("cards")
        .delete()
        .in("id", cardIds);

      if (error) throw error;

      setCards(cards.filter(card => !selectedCards.has(card.id)));
      
      // Update card counts for affected decks
      const deckUpdates = new Map<string, number>();
      cardsToDelete.forEach(card => {
        deckUpdates.set(card.deck_id, (deckUpdates.get(card.deck_id) || 0) + 1);
      });
      
      deckUpdates.forEach((count, deckId) => {
        updateDeckCardCount(deckId, -count);
      });
      
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
        triggerNewFolder={triggerNewFolder}
        triggerNewDeck={triggerNewDeck}
        onResetTriggers={() => {
          setTriggerNewFolder(false);
          setTriggerNewDeck(null);
        }}
      />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="relative h-16 border-b bg-card/60 supports-[backdrop-filter]:backdrop-blur-xl border-border/40 sticky top-0 z-30">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          
          <div className="relative flex items-center justify-between h-full px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
                  <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shadow-sm border border-primary/20">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-foreground via-foreground to-primary/80 bg-clip-text text-transparent">
                    Simple Anki
                  </h1>
                  <Sparkles className="h-4 w-4 text-primary/60 animate-pulse" />
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="relative group overflow-hidden border-primary/30 hover:border-primary/50 hover:bg-primary/5 hover:text-foreground transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
                <BookOpen className="h-4 w-4 mr-2 relative z-10 group-hover:scale-105 transition-transform duration-150" />
                <span className="relative z-10 hidden sm:inline font-medium text-current">Study Session</span>
                <span className="relative z-10 sm:hidden font-medium text-current">Study</span>
              </Button>
              
              {user && (
                <Button
                  variant="ghost"
                  onClick={signOut}
                  className="hover:bg-destructive/5 hover:text-destructive transition-all duration-150"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Sign Out</span>
                  <span className="sm:hidden">Logout</span>
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 bg-gradient-to-br from-background via-background to-primary/5 relative">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
          </div>
          <div className="relative z-10 container mx-auto px-6 py-8">
            {loading || dataLoading ? (
              <div className="relative flex flex-col items-center justify-center h-96">
                {/* Background decoration */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-16 left-16 w-12 h-12 bg-gradient-to-br from-primary/30 to-transparent rounded-full blur-xl animate-pulse" />
                  <div className="absolute bottom-16 right-16 w-16 h-16 bg-gradient-to-br from-accent/30 to-transparent rounded-full blur-xl animate-pulse delay-1000" />
                </div>
                
                <div className="relative z-10 text-center space-y-6">
                  {/* Enhanced loading spinner */}
                  <div className="relative">
                    <div className="w-20 h-20 mx-auto">
                      <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-primary animate-pulse" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">Loading Your Collection</h3>
                    <p className="text-muted-foreground">Preparing your flashcards...</p>
                  </div>
                </div>
              </div>
            ) : !currentDeck ? (
                <div className="relative flex flex-col items-center justify-center text-center py-20 px-4">
                {/* Background elements */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-16 left-16 w-20 h-20 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-xl animate-pulse" />
                  <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-br from-accent/30 to-primary/30 rounded-full blur-xl animate-pulse delay-1000" />
                </div>
                
                <div className="relative z-10 space-y-8">
                  {/* Enhanced icon with animation */}
                  <div className="relative mx-auto w-32 h-32 mb-8">
                    {/* Pulsing rings */}
                    <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
                    <div className="absolute inset-4 rounded-full border border-accent/40 animate-ping delay-300" />
                    
                    {/* Central icon */}
                    <div className="absolute inset-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-2xl">
                      <BookOpen className="h-12 w-12 text-white" />
                    </div>
                    
                    {/* Floating elements */}
                    <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-accent animate-pulse" />
                    <Plus className="absolute -bottom-2 -left-2 h-5 w-5 text-primary animate-pulse delay-500" />
                  </div>
                  
                  <div className="space-y-6">
                    <h2 className="text-4xl md:text-5xl font-bold">
                      <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                        Ready to Learn?
                      </span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                      {currentFolder ? 
                        `Create your first deck in "${currentFolder.name}" and start building your knowledge base` :
                        "Set up your learning journey by creating organized study spaces"
                      }
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 items-center pt-4">
                    <Button 
                      onClick={() => {
                        if (currentFolder) {
                          setTriggerNewDeck(currentFolder.id);
                        } else {
                          setTriggerNewFolder(true);
                        }
                      }}
                      size="lg"
                      className="group relative px-8 py-4 text-lg font-semibold bg-gradient-to-r from-primary via-primary to-accent hover:from-accent hover:via-primary hover:to-primary transition-all duration-500 shadow-xl hover:shadow-primary/30 transform hover:scale-105"
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                        {currentFolder ? "Create My First Deck" : "Start Your Journey"}
                      </span>
                      <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/20 to-accent/20 blur-xl group-hover:blur-2xl transition-all duration-300" />
                    </Button>
                    
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground text-sm font-medium">or</span>
                      
                      <Button 
                        onClick={handleGenerateSampleData}
                        disabled={isGeneratingSampleData}
                        variant="outline"
                        size="lg"
                        className="group border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 px-6 py-4"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md" />
                        <Layers3 className="h-5 w-5 mr-2 relative z-10 group-hover:scale-110 transition-transform duration-200" />
                        <span className="relative z-10">
                          {isGeneratingSampleData ? "Generating..." : "Try Sample Content"}
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Enhanced Breadcrumb & Header - Show when deck exists */}
                {currentFolder && currentDeck && (
                  <div className="relative text-center mb-10">
                    {/* Background decoration */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-4 left-1/4 w-8 h-8 bg-gradient-to-br from-primary/30 to-transparent rounded-full blur-lg animate-pulse" />
                      <div className="absolute top-8 right-1/4 w-6 h-6 bg-gradient-to-br from-accent/30 to-transparent rounded-full blur-lg animate-pulse delay-700" />
                    </div>
                    
                    <div className="relative z-10 space-y-6">
                      {/* Breadcrumb */}
                      <div className="flex items-center justify-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-card/60 backdrop-blur-sm rounded-full border border-border/50">
                          <Folder className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">{currentFolder.name}</span>
                          <span className="text-muted-foreground">/</span>
                          <Inbox className="h-4 w-4 text-accent" />
                          <span className="text-sm font-medium text-foreground">{currentDeck.name}</span>
                        </div>
                      </div>
                      
                      {/* Main Header */}
                      <div className="space-y-4">
                        <h2 className="text-4xl md:text-5xl font-bold">
                          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                            {currentDeck.name}
                          </span>
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                          Your personalized flashcard collection for mastering{" "}
                          <span className="font-semibold text-primary">{currentDeck.name.toLowerCase()}</span>
                        </p>
                        
                        {/* Quick stats */}
                        {currentDeckCards.length > 0 && (
                          <div className="flex items-center justify-center gap-6 pt-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                              <Layers3 className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium text-primary">
                                {currentDeckCards.length} {currentDeckCards.length === 1 ? 'card' : 'cards'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Add Card Modal */}
                <Dialog open={isAddCardModalOpen} onOpenChange={setIsAddCardModalOpen}>
                  <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-md border-border/50">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Add New Card
                      </DialogTitle>
                      <DialogDescription className="text-muted-foreground">
                        Create a new flashcard for your <span className="font-semibold text-primary">{currentDeck?.name}</span> deck.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <label htmlFor="card-front" className="text-sm font-medium">
                          Front of card
                        </label>
                        <Textarea
                          id="card-front"
                          placeholder="Enter the question or prompt..."
                          value={newCardFront}
                          onChange={(e) => setNewCardFront(e.target.value)}
                          className="min-h-[100px] resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="card-back" className="text-sm font-medium">
                          Back of card
                        </label>
                        <Textarea
                          id="card-back"
                          placeholder="Enter the answer or explanation..."
                          value={newCardBack}
                          onChange={(e) => setNewCardBack(e.target.value)}
                          className="min-h-[100px] resize-none"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddCardModalOpen(false);
                          setNewCardFront("");
                          setNewCardBack("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddCard}
                        disabled={!newCardFront.trim() || !newCardBack.trim()}
                      >
                        Add Card
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {currentDeckCards.length === 0 ? (
                  <div className="relative flex flex-col items-center justify-center text-center py-16 px-4">
                    {/* Background elements */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-8 left-8 w-16 h-16 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-xl animate-pulse" />
                      <div className="absolute bottom-8 right-8 w-20 h-20 bg-gradient-to-br from-accent/30 to-primary/30 rounded-full blur-xl animate-pulse delay-1000" />
                    </div>
                    
                    {/* Enhanced Visual Elements */}
                    <div className="relative mb-12">
                      <div className="relative mx-auto w-40 h-40">
                        {/* Pulsing rings */}
                        <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse" />
                        <div className="absolute inset-4 rounded-full border-2 border-accent/30 animate-pulse delay-300" />
                        <div className="absolute inset-8 rounded-full border border-primary/40 animate-pulse delay-700" />
                        
                        {/* Central icon */}
                        <div className="absolute inset-12 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-2xl">
                            <Layers3 className="h-8 w-8 text-white" />
                          </div>
                        </div>
                        
                        {/* Floating elements */}
                        <Sparkles className="absolute -top-4 -right-4 h-6 w-6 text-accent animate-pulse" />
                        <Plus className="absolute -bottom-4 -left-4 h-5 w-5 text-primary animate-pulse delay-500" />
                      </div>
                    </div>
                    
                    {/* Enhanced Headlines */}
                    <div className="relative z-10 space-y-6 mb-12">
                      <h3 className="text-4xl md:text-5xl font-bold">
                        <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                          Empty Deck
                        </span>
                        <br />
                        <span className="text-foreground text-2xl md:text-3xl">
                          Ready for Knowledge
                        </span>
                      </h3>
                      <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Your <span className="font-semibold text-primary">{currentDeck?.name}</span> deck is waiting for its first card.
                        <span className="block mt-2 text-lg">Let's start building your knowledge base! 🚀</span>
                      </p>
                    </div>

                    {/* Enhanced CTA Section */}
                    <div className="relative z-10">
                      <Button 
                        onClick={() => setIsAddCardModalOpen(true)}
                        size="lg"
                        className="group relative px-12 py-6 text-xl font-bold bg-gradient-to-r from-primary via-primary to-accent hover:from-accent hover:via-primary hover:to-primary transition-all duration-500 shadow-2xl hover:shadow-primary/40 transform hover:scale-105"
                      >
                        <span className="relative z-10 flex items-center gap-3">
                          <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
                          Create Your First Card
                        </span>
                        <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/30 to-accent/30 blur-xl group-hover:blur-2xl transition-all duration-300" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>


                    {/* Header with Search */}
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 mb-8">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                            <Inbox className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-foreground">
                              Your Cards
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {filteredCards.length} {filteredCards.length === 1 ? 'card' : 'cards'} in {currentDeck?.name}
                            </p>
                          </div>
                        </div>
                        
                        {selectedCards.size > 0 && (
                          <div className="flex items-center gap-3 ml-6">
                            <div className="px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                              <span className="text-sm font-medium text-primary">
                                {selectedCards.size} selected
                              </span>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={handleBulkDelete}
                              className="flex items-center gap-2 hover:scale-102 transition-transform duration-150"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete Selected
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {/* Search and Filters */}
                      <div className="flex flex-col sm:flex-row gap-3 lg:min-w-[500px]">
                        {/* Search */}
                        <div className="flex-1">
                          <div className="relative group">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-150 z-10" />
                            <Input
                              placeholder="Search cards..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10 h-10 bg-card border-border/50 focus:border-primary/50 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-200"
                            />
                          </div>
                        </div>

                        {/* Filter */}
                        <div>
                          <Select value={filterState} onValueChange={setFilterState}>
                            <SelectTrigger className="w-40 h-10 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-150">
                              <div className="flex items-center gap-1">
                                <Filter className="h-3 w-3 text-primary" />
                                <SelectValue placeholder="State" />
                              </div>
                            </SelectTrigger>
                            <SelectContent className="bg-card/95 backdrop-blur-md border-border/50">
                              <SelectItem value="all">All States</SelectItem>
                              <SelectItem value="new">🌟 New</SelectItem>
                              <SelectItem value="learning">📚 Learning</SelectItem>
                              <SelectItem value="review">🔄 Review</SelectItem>
                              <SelectItem value="relearning">🔁 Relearning</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>


                    {/* Cards Display */}
                    {filteredCards.length === 0 ? (
                      <div className="relative text-center py-16">
                        {/* Background decoration */}
                        <div className="absolute inset-0 opacity-20">
                          <div className="absolute top-8 left-1/4 w-12 h-12 bg-gradient-to-br from-primary/30 to-transparent rounded-full blur-lg animate-pulse" />
                          <div className="absolute bottom-8 right-1/4 w-16 h-16 bg-gradient-to-br from-accent/30 to-transparent rounded-full blur-lg animate-pulse delay-500" />
                        </div>
                        
                        <div className="relative z-10 space-y-6">
                          {/* Enhanced icon */}
                          <div className="relative mx-auto w-24 h-24 mb-6">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full animate-pulse" />
                            <div className="absolute inset-2 bg-card rounded-full flex items-center justify-center shadow-lg">
                              <Filter className="h-10 w-10 text-primary" />
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <h3 className="text-2xl font-bold">
                              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                No Matches Found
                              </span>
                            </h3>
                            <p className="text-lg text-muted-foreground max-w-md mx-auto">
                              Try adjusting your search or filter criteria to find your cards
                            </p>
                          </div>
                          
                          {/* Suggestion */}
                          <div className="mt-8">
                                                      <Button 
                            variant="outline" 
                            onClick={() => {
                              setSearchQuery("");
                              setFilterState("all");
                              setFilterDueDate("all");
                            }}
                            className="border-primary/30 hover:bg-primary/5 transition-all duration-150"
                          >
                              Clear All Filters
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                         {/* Add Card Button - Always first */}
                         <Card 
                           className="group relative transition-all duration-200 hover:shadow-lg hover:shadow-primary/15 cursor-pointer border-dashed border-2 border-primary/30 hover:border-primary/60 bg-card/60 backdrop-blur-sm hover:scale-[1.01] overflow-hidden"
                           onClick={() => setIsAddCardModalOpen(true)}
                         >
                           {/* Gradient hover effect */}
                           <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                           
                           <CardContent className="relative z-10 p-6 h-full flex flex-col items-center justify-center min-h-[140px] space-y-3">
                             <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-150">
                               <Plus className="h-6 w-6 text-primary group-hover:rotate-45 transition-transform duration-150" />
                             </div>
                             <div className="text-center">
                               <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-150">Add New Card</span>
                             </div>
                           </CardContent>
                         </Card>

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
                                   group relative transition-all duration-200 hover:shadow-lg hover:shadow-primary/8 cursor-pointer min-h-[140px] bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/30 hover:scale-[1.01] overflow-hidden
                                   ${selectedCards.has(card.id) 
                                     ? 'ring-2 ring-primary bg-primary/10 shadow-lg shadow-primary/15 scale-[1.01]' 
                                     : ''
                                   }
                                 `}
                                 onClick={() => handleCardSelection(card.id)}
                               >
                                {/* Glass morphism overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                {/* Selection indicator - Checkbox style */}
                                <div className={`
                                  absolute top-4 left-4 w-4 h-4 rounded-md border-2 transition-all duration-150 flex items-center justify-center
                                  ${selectedCards.has(card.id) 
                                    ? 'bg-primary border-primary' 
                                    : 'border-muted-foreground/30 group-hover:border-primary/50'
                                  }
                                `}>
                                  {selectedCards.has(card.id) && (
                                    <svg 
                                      className="w-3 h-3 text-primary-foreground animate-scale-in" 
                                      fill="none" 
                                      stroke="currentColor" 
                                      viewBox="0 0 24 24"
                                    >
                                      <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={3} 
                                        d="M5 13l4 4L19 7" 
                                      />
                                    </svg>
                                  )}
                                </div>

                                <CardContent className="p-4 pl-10">
                                  <div className="space-y-3">
                                    {/* Header with title, badge, and actions */}
                                    <div className="space-y-2">
                                      <div className="flex items-start justify-between gap-2">
                                        <h3 className="font-medium text-card-foreground leading-tight line-clamp-2 flex-1">
                                          {card.front}
                                        </h3>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                          {card.state && (
                                            <Badge 
                                              variant="secondary"
                                              className={`text-xs h-5 ${getStateBadgeColor(card.state)}`}
                                            >
                                              {card.state}
                                            </Badge>
                                          )}
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-6 w-6 p-0"
                                                onClick={(e) => e.stopPropagation()}
                                              >
                                                <MoreHorizontal className="h-3 w-3" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-32 bg-background border shadow-md z-50">
                                              <DropdownMenuItem
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  editCard(card.id, card.front, card.back);
                                                }}
                                                className="cursor-pointer"
                                              >
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit
                                              </DropdownMenuItem>
                                              <DropdownMenuItem
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  deleteCard(card.id);
                                                }}
                                                className="text-destructive cursor-pointer focus:text-destructive"
                                              >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Back content preview - only visible on hover */}
                                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-xs text-muted-foreground/80 line-clamp-2 border-l-2 border-muted pl-3">
                                      <span className="font-medium text-muted-foreground">Answer:</span> {card.back}
                                    </div>

                                    {/* Footer with progress and due date */}
                                    <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        {/* Due date with enhanced styling */}
                                        {card.due_date ? (
                                           <div className={`text-xs flex items-center gap-1.5 font-medium ${getDueDateStatusClass(getDueDateInfo(card.due_date))}`}>
                                             <Clock className="h-3 w-3" />
                                             <span>
                                               {getDueDateInfo(card.due_date).label}
                                             </span>
                                           </div>
                                        ) : (
                                          <div className="text-xs flex items-center gap-1.5 text-muted-foreground/60">
                                            <Sparkles className="h-3 w-3" />
                                            <span>New card</span>
                                          </div>
                                        )}

                                      </div>

                                      {/* Quick study action */}
                                      {card.due_date && new Date(card.due_date) <= new Date() && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-6 text-xs px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            navigate('/study');
                                          }}
                                        >
                                          Study Now
                                        </Button>
                                      )}
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
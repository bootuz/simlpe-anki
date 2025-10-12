import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar, StudyFolder, Deck } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BookOpen,
  Folder, 
  Plus, 
  LogOut, 
  Layers3,
  Sparkles,
  Inbox,
  Trash2,
  Filter,
  Settings,
  Trophy,
  Zap,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserLevel } from "@/hooks/useUserLevel";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCardMutations } from "@/hooks/useOptimizedQueries";
import { CardItem } from "@/components/cards";
import { SearchAndFilters, EnhancedAddCardModal } from "@/components/forms";
import { useCardManagement } from "@/hooks/useCardManagement";
import { useCardFiltering } from "@/hooks/useCardFiltering";
import SimplifiedDeckSelector from "@/components/SimplifiedDeckSystem";

interface Card {
  id: string;
  front: string;
  back: string;
  deck_id: string;
  created_at: string;
  updated_at: string;
  state?: string; // FSRS state
  due_date?: string; // FSRS due date
  tags?: string[]; // Card tags
}

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const { level, features, canUpgrade, upgradeToNextLevel, toggleAdvancedMode, isAdvancedModeEnabled } = useUserLevel();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addCard: addCardMutation } = useCardMutations();
  
  const [isGeneratingSampleData, setIsGeneratingSampleData] = useState(false);
  const [folders, setFolders] = useState<StudyFolder[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string>("");
  const [currentDeckId, setCurrentDeckId] = useState<string>("");
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  
  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState<string>("all");
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  
  // Sidebar trigger state
  const [triggerNewFolder, setTriggerNewFolder] = useState(false);
  const [triggerNewDeck, setTriggerNewDeck] = useState<string | null>(null);

  // Helper function to update deck card counts
  const updateDeckCardCount = useCallback((deckId: string, change: number) => {
    setFolders(prev => prev.map(folder => ({
      ...folder,
      decks: folder.decks.map(deck => 
        deck.id === deckId 
          ? { ...deck, cardCount: Math.max(0, deck.cardCount + change) }
          : deck
      )
    })));
  }, []);

  // Use custom hooks
  const cardManagement = useCardManagement(cards, setCards, updateDeckCardCount);
  // Get current deck cards first
  const currentDeckCards = cards.filter(card => card.deck_id === currentDeckId);
  const { filteredCards } = useCardFiltering(currentDeckCards, searchQuery, filterState);

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

  // Reload all cards when deck changes to ensure fresh data
  useEffect(() => {
    if (user && currentDeckId) {
      loadAllCards();
    }
  }, [user, currentDeckId]);

  const loadAllCards = async () => {
    try {
      const { data: cardsData, error } = await supabase
        .from("cards_with_details")
        .select("*")
        .order("created_at");

      if (error) throw error;

      // Transform cards data to include FSRS state
      const transformedCards: Card[] = (cardsData || []).map(card => ({
        id: card.id,
        front: card.front,
        back: card.back,
        deck_id: card.deck_id,
        created_at: card.created_at,
        updated_at: card.updated_at,
        state: card.state,
        due_date: card.due_date,
        tags: [] // Note: tags field not in view, using fallback
      }));

      // Update cards state with all user's cards
      setCards(transformedCards);
    } catch (error) {
      console.error("Error loading cards:", error);
    }
  };

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
        due_date: card.due_date,
        tags: [] // Note: tags field not in view, using fallback
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

  // Get current deck cards and info (already defined above)
  const currentFolder = folders.find(f => f.id === currentFolderId);
  const currentDeck = currentFolder?.decks.find(d => d.id === currentDeckId);

  const handleAddCard = async (front: string, back: string, tags: string[] = [], closeModal: boolean = true) => {
    if (!user || !front.trim() || !back.trim()) return;
    
    try {
      const result = await addCardMutation.mutateAsync({
        front: front.trim(),
        back: back.trim(),
        deckId: currentDeckId,
        tags
      });

      // Update local state with the new card
      const newCard: Card = {
        ...result,
        state: 'New',
        due_date: null,
        tags
      };
      setCards([...cards, newCard]);
      
      // Update local UI state
      updateDeckCardCount(currentDeckId, 1);
      
      // Only close modal if requested
      if (closeModal) {
        setIsAddCardModalOpen(false);
      }
      
      // Note: addCardMutation already shows success toast and updates Home page cache
    } catch (error) {
      console.error("Error adding card:", error);
      // Note: addCardMutation already shows error toast
    }
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


  // Sidebar handlers
  const handleFolderSelect = (folderId: string) => {
    setCurrentFolderId(folderId);
    const folder = folders.find(f => f.id === folderId);
    if (folder && folder.decks.length > 0) {
      setCurrentDeckId(folder.decks[0].id);
    }
  };

  const handleDeckSelect = (folderId: string, deckId: string) => {
    setCurrentFolderId(folderId);
    setCurrentDeckId(deckId);
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

  const getStateBadgeColor = (state?: string) => {
    switch (state) {
      case "New": return "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30";
      case "Learning": return "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30";
      case "Review": return "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30";
      case "Relearning": return "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30";
      default: return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
    }
  };

  // For beginners, show simplified interface
  if (level === 'beginner' && !isAdvancedModeEnabled) {
    return (
      <div className="flex-1 flex flex-col">
        {/* Simplified Header */}
        <header className="relative h-16 border-b bg-card/60 supports-[backdrop-filter]:backdrop-blur-xl border-border/40 sticky top-0 z-30">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          <div className="relative flex items-center justify-between h-full px-6">
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
            
            <div className="flex items-center gap-2 sm:gap-3">
              {canUpgrade && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={upgradeToNextLevel}
                  className="border-primary/30 hover:border-primary/50 hover:bg-primary/5"
                >
                  <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
                  <span className="hidden sm:inline">Unlock Features</span>
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="relative group overflow-hidden border-primary/30 hover:border-primary/50 hover:bg-primary/5"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Study</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAdvancedMode}
                title="Switch to advanced view"
              >
                <Settings className="h-4 w-4" />
              </Button>
              {user && (
                <Button
                  variant="ghost"
                  onClick={signOut}
                  className="hover:bg-destructive/5 hover:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              )}
            </div>
          </div>
        </header>
        
        {/* Simplified Main Content */}
        <main className="flex-1 bg-gradient-to-br from-background via-background to-primary/5 relative">
          <SimplifiedDeckSelector />
        </main>
      </div>
    );
  }

  // Advanced/Classic view for intermediate and advanced users
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
                  <div 
                    className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-foreground via-foreground to-primary/80 bg-clip-text text-transparent"
                    role="banner"
                    aria-label="Simple Anki brand"
                  >
                    Simple Anki
                  </div>
                  <Sparkles className="h-4 w-4 text-primary/60 animate-pulse" />
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Level Badge */}
              {level !== 'beginner' && (
                <div className="px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                  <span className="text-xs font-semibold text-primary flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    {level === 'intermediate' ? 'Intermediate' : 'Advanced'}
                  </span>
                </div>
              )}
              
              {/* Toggle to Simple View */}
              {level !== 'beginner' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleAdvancedMode}
                  title="Switch to simple view"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="border-border hover:bg-primary/10 hover:text-primary hover:border-primary/50"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline font-medium">Study Session</span>
                <span className="sm:hidden font-medium">Study</span>
              </Button>
              
              {user && (
                <Button
                  variant="ghost"
                  onClick={signOut}
                  className="hover:bg-destructive/20 hover:text-destructive"
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
                        size="lg"
                        className="group px-6 py-4 bg-gradient-to-r from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-2xl hover:shadow-primary/40 transform hover:scale-105 transition-all duration-300"
                      >
                        <Layers3 className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200 text-white" />
                        <span>
                          {isGeneratingSampleData ? "Generating..." : "Try Sample Content"}
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Enhanced Breadcrumb & Header - Show when deck has cards */}
                {currentFolder && currentDeck && currentDeckCards.length > 0 && (
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
                        <div className="flex items-center justify-center gap-6 pt-4">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                            <Layers3 className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                              {currentDeckCards.length} {currentDeckCards.length === 1 ? 'card' : 'cards'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <EnhancedAddCardModal
                  isOpen={isAddCardModalOpen}
                  onClose={() => setIsAddCardModalOpen(false)}
                  onSubmit={handleAddCard}
                  deckName={currentDeck?.name}
                />

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
                      
                      <SearchAndFilters
                        searchQuery={searchQuery}
                        filterState={filterState}
                        onSearchChange={setSearchQuery}
                        onFilterStateChange={setFilterState}
                      />
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
                              <CardItem
                                key={card.id}
                                card={card}
                                isSelected={selectedCards.has(card.id)}
                                onSelect={handleCardSelection}
                                onEdit={editCard}
                                onDelete={deleteCard}
                                onStudy={() => navigate('/study')}
                                getStateBadgeColor={getStateBadgeColor}
                              />
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
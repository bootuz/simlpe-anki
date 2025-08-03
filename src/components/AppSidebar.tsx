import { useState, useEffect } from "react";
import { 
  Folder, 
  FolderOpen, 
  BookOpen, 
  Plus, 
  MoreHorizontal,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Settings
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export interface Deck {
  id: string;
  name: string;
  cardCount: number;
}

export interface StudyFolder {
  id: string;
  name: string;
  decks: Deck[];
  isExpanded?: boolean;
}

interface AppSidebarProps {
  folders: StudyFolder[];
  currentFolderId?: string;
  currentDeckId?: string;
  onFolderSelect: (folderId: string) => void;
  onDeckSelect: (folderId: string, deckId: string) => void;
  onCreateFolder: (name: string) => void;
  onCreateDeck: (folderId: string, name: string) => void;
  onRenameFolder: (folderId: string, name: string) => void;
  onRenameDeck: (folderId: string, deckId: string, name: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onDeleteDeck: (folderId: string, deckId: string) => void;
  onToggleFolder: (folderId: string) => void;
  triggerNewFolder?: boolean;
  triggerNewDeck?: string | null;
  onResetTriggers?: () => void;
}

export function AppSidebar({
  folders,
  currentFolderId,
  currentDeckId,
  onFolderSelect,
  onDeckSelect,
  onCreateFolder,
  onCreateDeck,
  onRenameFolder,
  onRenameDeck,
  onDeleteFolder,
  onDeleteDeck,
  onToggleFolder,
  triggerNewFolder,
  triggerNewDeck,
  onResetTriggers,
}: AppSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [newFolderName, setNewFolderName] = useState("");
  const [newDeckName, setNewDeckName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [showNewDeck, setShowNewDeck] = useState<string | null>(null);
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editingDeck, setEditingDeck] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // Handle external triggers
  useEffect(() => {
    if (triggerNewFolder) {
      setShowNewFolder(true);
      onResetTriggers?.();
    }
  }, [triggerNewFolder, onResetTriggers]);

  useEffect(() => {
    if (triggerNewDeck) {
      setShowNewDeck(triggerNewDeck);
      onResetTriggers?.();
    }
  }, [triggerNewDeck, onResetTriggers]);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName("");
      setShowNewFolder(false);
    }
  };

  const handleCreateDeck = (folderId: string) => {
    if (newDeckName.trim()) {
      onCreateDeck(folderId, newDeckName.trim());
      setNewDeckName("");
      setShowNewDeck(null);
    }
  };

  const handleStartEdit = (type: 'folder' | 'deck', id: string, currentName: string) => {
    if (type === 'folder') {
      setEditingFolder(id);
    } else {
      setEditingDeck(id);
    }
    setEditName(currentName);
  };

  const handleSaveEdit = () => {
    if (editName.trim()) {
      if (editingFolder) {
        onRenameFolder(editingFolder, editName.trim());
        setEditingFolder(null);
      } else if (editingDeck) {
        const folder = folders.find(f => f.decks.some(d => d.id === editingDeck));
        if (folder) {
          onRenameDeck(folder.id, editingDeck, editName.trim());
        }
        setEditingDeck(null);
      }
    }
    setEditName("");
  };

  const handleCancelEdit = () => {
    setEditingFolder(null);
    setEditingDeck(null);
    setEditName("");
  };

  return (
    <Sidebar className={`${isCollapsed ? "w-14" : "w-64"} border-r bg-card/50 backdrop-blur-sm`}>
      
      <SidebarContent className="px-3 py-4">
        <SidebarGroup className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <SidebarGroupLabel className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">
              Cards Library
            </SidebarGroupLabel>
            {!isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => setShowNewFolder(true)}
                title="Add new folder"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>

          <SidebarGroupContent>
            <SidebarMenu>
              {/* New Folder Input */}
              {showNewFolder && !isCollapsed && (
                <SidebarMenuItem className="mb-2">
                  <div className="px-2 py-1">
                    <Input
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Folder name..."
                      className="h-8 text-sm border-primary/30 focus:border-primary"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateFolder();
                        if (e.key === 'Escape') setShowNewFolder(false);
                      }}
                      onBlur={() => setShowNewFolder(false)}
                      autoFocus
                    />
                  </div>
                </SidebarMenuItem>
              )}

              {/* Folders */}
              {folders.map((folder) => (
                <div key={folder.id}>
                  <SidebarMenuItem className="mb-2">
                    <div className="flex items-center w-full group">
                      <SidebarMenuButton
                        className={`flex-1 rounded-lg transition-all duration-200 ${
                          currentFolderId === folder.id 
                            ? "bg-primary/10 text-primary border border-primary/20 shadow-sm" 
                            : "hover:bg-muted/60 hover:shadow-sm"
                        }`}
                        onClick={() => {
                          onToggleFolder(folder.id);
                          onFolderSelect(folder.id);
                        }}
                      >
                        <div className="flex items-center py-1">
                          {!isCollapsed && (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleFolder(folder.id);
                              }}
                              className="mr-2 cursor-pointer p-0.5 rounded hover:bg-accent/50 transition-colors"
                            >
                              {folder.isExpanded ? (
                                <ChevronDown className="h-3 w-3 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                          )}
                          {folder.isExpanded ? (
                            <FolderOpen className="h-4 w-4 mr-3 text-primary" />
                          ) : (
                            <Folder className="h-4 w-4 mr-3 text-muted-foreground" />
                          )}
                          {!isCollapsed && (
                            <span className="flex-1 font-medium text-sm">
                              {editingFolder === folder.id ? (
                                <Input
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="h-7 text-sm border-primary/30 focus:border-primary"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveEdit();
                                    if (e.key === 'Escape') handleCancelEdit();
                                  }}
                                  onBlur={handleSaveEdit}
                                  autoFocus
                                />
                              ) : (
                                folder.name
                              )}
                            </span>
                          )}
                        </div>
                      </SidebarMenuButton>
                      
                      {!isCollapsed && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0 ml-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent"
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => setShowNewDeck(folder.id)}
                              className="cursor-pointer"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Deck
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStartEdit('folder', folder.id, folder.name)}
                              className="cursor-pointer"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onDeleteFolder(folder.id)}
                              className="text-destructive cursor-pointer focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </SidebarMenuItem>

                  {/* New Deck Input */}
                  {showNewDeck === folder.id && !isCollapsed && (
                    <SidebarMenuItem className="ml-6 mb-2">
                      <div className="px-2 py-1">
                        <Input
                          value={newDeckName}
                          onChange={(e) => setNewDeckName(e.target.value)}
                          placeholder="Deck name..."
                          className="h-8 text-sm border-primary/30 focus:border-primary"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCreateDeck(folder.id);
                            if (e.key === 'Escape') setShowNewDeck(null);
                          }}
                          onBlur={() => setShowNewDeck(null)}
                          autoFocus
                        />
                      </div>
                    </SidebarMenuItem>
                  )}

                  {/* Decks */}
                  {folder.isExpanded && folder.decks.map((deck) => (
                    <SidebarMenuItem key={deck.id} className="ml-6 mb-0.5">
                      <div className="flex items-center w-full group">
                        <SidebarMenuButton
                          className={`flex-1 rounded-md transition-all duration-200 min-h-[32px] ${
                            currentDeckId === deck.id 
                              ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary hover:text-primary-foreground" 
                              : "hover:bg-muted/40 hover:shadow-sm"
                          }`}
                          onClick={() => onDeckSelect(folder.id, deck.id)}
                        >
                          <div className="flex items-center justify-between w-full py-1">
                            <div className="flex items-center min-w-0 flex-1">
                              <BookOpen className="h-4 w-4 mr-3 text-current shrink-0" />
                              {!isCollapsed && (
                                <span className="text-sm font-medium truncate">
                                  {editingDeck === deck.id ? (
                                    <Input
                                      value={editName}
                                      onChange={(e) => setEditName(e.target.value)}
                                      className="h-6 text-sm border-primary/30 focus:border-primary"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveEdit();
                                        if (e.key === 'Escape') handleCancelEdit();
                                      }}
                                      onBlur={handleSaveEdit}
                                      autoFocus
                                    />
                                  ) : (
                                    deck.name
                                  )}
                                </span>
                              )}
                            </div>
                            {!isCollapsed && (
                              <span className="text-xs bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-full font-medium ml-2 shrink-0">
                                {deck.cardCount}
                              </span>
                            )}
                          </div>
                        </SidebarMenuButton>
                        
                        {!isCollapsed && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-7 p-0 ml-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent"
                              >
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => handleStartEdit('deck', deck.id, deck.name)}
                                className="cursor-pointer"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onDeleteDeck(folder.id, deck.id)}
                                className="text-destructive cursor-pointer focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </SidebarMenuItem>
                  ))}
                </div>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Navigation Section */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <NavLink
                  to="/settings"
                  className={({ isActive }) => 
                    `flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? "bg-primary/10 text-primary border border-primary/20 shadow-sm" 
                        : "hover:bg-muted/60 hover:shadow-sm text-muted-foreground hover:text-foreground"
                    }`
                  }
                >
                  <Settings className="h-4 w-4 mr-3" />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">Settings</span>
                  )}
                </NavLink>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
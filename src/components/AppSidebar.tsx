import { useState } from "react";
import { 
  Folder, 
  FolderOpen, 
  BookOpen, 
  Plus, 
  MoreHorizontal,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown
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
    <Sidebar className={isCollapsed ? "w-14" : "w-64"}>
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between">
            <SidebarGroupLabel>Study Library</SidebarGroupLabel>
            {!isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setShowNewFolder(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>

          <SidebarGroupContent>
            <SidebarMenu>
              {/* New Folder Input */}
              {showNewFolder && !isCollapsed && (
                <SidebarMenuItem>
                  <div className="px-2 py-1">
                    <Input
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Folder name..."
                      className="h-8 text-sm"
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
                  <SidebarMenuItem>
                    <div className="flex items-center w-full">
                      <SidebarMenuButton
                        className={`flex-1 ${
                          currentFolderId === folder.id 
                            ? "bg-accent text-accent-foreground" 
                            : "hover:bg-accent/50"
                        }`}
                        onClick={() => {
                          onToggleFolder(folder.id);
                          onFolderSelect(folder.id);
                        }}
                      >
                        <div className="flex items-center">
                          {!isCollapsed && (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleFolder(folder.id);
                              }}
                              className="mr-1 cursor-pointer"
                            >
                              {folder.isExpanded ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <ChevronRight className="h-3 w-3" />
                              )}
                            </div>
                          )}
                          {folder.isExpanded ? (
                            <FolderOpen className="h-4 w-4 mr-2" />
                          ) : (
                            <Folder className="h-4 w-4 mr-2" />
                          )}
                          {!isCollapsed && (
                            <span className="flex-1">
                              {editingFolder === folder.id ? (
                                <Input
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="h-6 text-sm"
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
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setShowNewDeck(folder.id)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Deck
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStartEdit('folder', folder.id, folder.name)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onDeleteFolder(folder.id)}
                              className="text-destructive"
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
                    <SidebarMenuItem>
                      <div className="pl-6 pr-2 py-1">
                        <Input
                          value={newDeckName}
                          onChange={(e) => setNewDeckName(e.target.value)}
                          placeholder="Deck name..."
                          className="h-8 text-sm"
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
                    <SidebarMenuItem key={deck.id}>
                      <div className="flex items-center w-full pl-4">
                        <SidebarMenuButton
                          className={`flex-1 ${
                            currentDeckId === deck.id 
                              ? "bg-primary text-primary-foreground" 
                              : "hover:bg-accent/50"
                          }`}
                          onClick={() => onDeckSelect(folder.id, deck.id)}
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          {!isCollapsed && (
                            <div className="flex items-center justify-between w-full">
                              <span>
                                {editingDeck === deck.id ? (
                                  <Input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="h-6 text-sm"
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
                              <span className="text-xs opacity-60 ml-2">
                                {deck.cardCount}
                              </span>
                            </div>
                          )}
                        </SidebarMenuButton>
                        
                        {!isCollapsed && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleStartEdit('deck', deck.id, deck.name)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onDeleteDeck(folder.id, deck.id)}
                                className="text-destructive"
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
      </SidebarContent>
    </Sidebar>
  );
}
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, LogOut, Sparkles } from "lucide-react";

interface HomeHeaderProps {
  onManageDecks: () => void;
  onSignOut: () => void | Promise<void>;
}

export default function HomeHeader({ onManageDecks, onSignOut }: HomeHeaderProps) {
  return (
    <header className="relative bg-card/60 supports-[backdrop-filter]:backdrop-blur-xl border-b border-border/40 sticky top-0 z-30 animate-fade-in">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
        
        <div className="flex items-center gap-2 sm:gap-3">
          <Button 
            variant="outline" 
            onClick={onManageDecks} 
            className="border-border hover:bg-muted transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
            <span className="hidden sm:inline font-medium">Manage Cards</span>
            <span className="sm:hidden font-medium">Manage</span>
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={onSignOut} 
            className="hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Sign Out</span>
            <span className="sm:hidden">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

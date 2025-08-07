import { Button } from "@/components/ui/button";
import { BookOpen, Plus, LogOut } from "lucide-react";

interface HomeHeaderProps {
  onManageDecks: () => void;
  onSignOut: () => void | Promise<void>;
}

export default function HomeHeader({ onManageDecks, onSignOut }: HomeHeaderProps) {
  return (
    <header className="bg-card/80 supports-[backdrop-filter]:backdrop-blur border-b border-border/50 sticky top-0 z-30 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Simple Anki</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="outline" onClick={onManageDecks} className="hover-scale">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Manage Cards</span>
            <span className="sm:hidden">Manage</span>
          </Button>
          <Button variant="ghost" onClick={onSignOut} className="hover-scale">
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Sign Out</span>
            <span className="sm:hidden">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

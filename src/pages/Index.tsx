import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HomeCards } from "@/components/HomeCards";
import { AppSidebar, StudyFolder } from "@/components/AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { BookOpen, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <AppSidebar
        folders={[]}
        currentFolderId=""
        currentDeckId=""
        onFolderSelect={() => {}}
        onDeckSelect={() => {}}
        onCreateFolder={async () => {}}
        onCreateDeck={async () => {}}
        onRenameFolder={async () => {}}
        onRenameDeck={async () => {}}
        onDeleteFolder={async () => {}}
        onDeleteDeck={async () => {}}
        onToggleFolder={() => {}}
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
            
            <div className="flex items-center gap-4">
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
        <main className="flex-1">
          <HomeCards />
        </main>
      </div>
    </>
  );
};

export default Index;
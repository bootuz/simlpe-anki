import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, Home, ArrowLeft, AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none"></div>
      <div className="relative z-10">
        {/* Header */}
        <header className="h-16 border-b bg-card/80 backdrop-blur-md supports-[backdrop-filter]:bg-card/60 shadow-sm w-full">
          <div className="flex items-center justify-between h-full px-6 w-full">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
              <div className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold">Simple Anki</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="py-8 w-full">
          <div className="max-w-2xl mx-auto px-6">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="text-6xl font-bold text-muted-foreground">404</h2>
              <h3 className="text-2xl font-semibold">Page Not Found</h3>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Sorry, we couldn't find the page you're looking for. The page might have been moved or doesn't exist.
              </p>
              <div className="flex justify-center gap-4 pt-4">
                <Button onClick={() => navigate("/")} size="lg">
                  <Home className="h-5 w-5 mr-2" />
                  Back to Home
                </Button>
                <Button variant="outline" onClick={() => navigate("/manage")} size="lg">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Manage Decks
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotFound;

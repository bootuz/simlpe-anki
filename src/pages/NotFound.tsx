import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, Home, ArrowLeft, AlertTriangle, Sparkles, Zap, Search } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
      </div>
      
      <div className="relative z-10">
        {/* Modern Header */}
        <header className="relative bg-card/60 supports-[backdrop-filter]:backdrop-blur-xl border-b border-border/40 sticky top-0 z-30 animate-fade-in">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate(-1)}
                className="border-border hover:bg-muted transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
        </header>

        {/* Main Content */}
        <main className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-xl animate-pulse" />
            <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-xl animate-pulse delay-1000" />
            <div className="absolute bottom-32 left-1/4 w-16 h-16 bg-gradient-to-br from-primary/30 to-transparent rounded-full blur-lg animate-pulse delay-500" />
          </div>

          <section className="relative max-w-4xl mx-auto px-4 animate-fade-in">
            <div className="text-center space-y-12">
              {/* Enhanced 404 Visual */}
              <div className="relative mb-12">
                <div className="relative mx-auto w-40 h-40 mb-8">
                  {/* Pulsing rings */}
                  <div className="absolute inset-0 rounded-full border-2 border-destructive/20 animate-pulse" />
                  <div className="absolute inset-4 rounded-full border-2 border-destructive/30 animate-pulse delay-300" />
                  <div className="absolute inset-8 rounded-full border border-destructive/40 animate-pulse delay-700" />
                  
                  {/* Central icon */}
                  <div className="absolute inset-12 bg-gradient-to-br from-destructive/20 via-destructive/10 to-orange-500/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <div className="w-16 h-16 bg-gradient-to-br from-destructive to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                      <AlertTriangle className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  
                  {/* Floating elements */}
                  <Search className="absolute -top-4 -right-4 h-6 w-6 text-destructive animate-pulse" />
                  <Zap className="absolute -bottom-4 -left-4 h-5 w-5 text-orange-500 animate-pulse delay-500" />
                </div>
              </div>
              
              <div className="space-y-8">
                {/* 404 Number */}
                <div className="relative">
                  <h2 className="text-8xl md:text-9xl font-bold">
                    <span className="bg-gradient-to-r from-destructive via-orange-500 to-destructive bg-clip-text text-transparent">
                      404
                    </span>
                  </h2>
                </div>
                
                {/* Main Message */}
                <div className="space-y-4">
                  <h3 className="text-3xl md:text-4xl font-bold text-foreground">
                    Page Not Found
                  </h3>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Oops! It looks like this page got lost in the digital void. 
                    <span className="block mt-2 text-lg">Don't worry, let's get you back on track! 🚀</span>
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
                  <Button 
                    onClick={() => navigate("/")} 
                    size="lg"
                    className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90"
                  >
                    <Home className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-300 text-white" />
                    Back to Home
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/manage")} 
                    size="lg"
                    className="px-8 py-4 text-lg border-border hover:bg-muted"
                  >
                    <BookOpen className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-medium">Manage Cards</span>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default NotFound;

import { Brain, Twitter, Github, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-muted/50 border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-foreground">Simple Anki</span>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6 max-w-md">
                Transform your learning with scientifically-proven spaced repetition. 
                Master any subject faster and remember it longer.
              </p>
              <Button
                onClick={() => navigate("/auth")}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Start Learning Today
              </Button>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-3">
                <li>
                  <button 
                    onClick={() => navigate("/auth")}
                    className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate("/auth")}
                    className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    How It Works
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate("/auth")}
                    className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    Pricing
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate("/auth")}
                    className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    FAQ
                  </button>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-3">
                <li>
                  <button className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    About Us
                  </button>
                </li>
                <li>
                  <button className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Blog
                  </button>
                </li>
                <li>
                  <button className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Contact
                  </button>
                </li>
                <li>
                  <button className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Privacy Policy
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-8 border-t border-border/50">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2024 Simple Anki. All rights reserved.
            </div>
            
            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </button>
              <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </button>
              <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
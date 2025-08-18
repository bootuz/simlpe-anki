import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { validateCardContent, sanitizeCardContent } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface AddCardFormProps {
  onAdd: (front: string, back: string) => void;
}

export const AddCardForm = ({ onAdd }: AddCardFormProps) => {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate front content
    const frontValidation = validateCardContent(front);
    if (!frontValidation.isValid) {
      toast({
        title: "Invalid front content",
        description: frontValidation.error,
        variant: "destructive",
      });
      return;
    }
    
    // Validate back content
    const backValidation = validateCardContent(back);
    if (!backValidation.isValid) {
      toast({
        title: "Invalid back content",
        description: backValidation.error,
        variant: "destructive",
      });
      return;
    }
    
    // Sanitize and submit
    const sanitizedFront = sanitizeCardContent(front);
    const sanitizedBack = sanitizeCardContent(back);
    
    onAdd(sanitizedFront, sanitizedBack);
    setFront("");
    setBack("");
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <div className="w-full">
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full p-6 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 hover:bg-muted/40 hover:border-muted-foreground/50 transition-all duration-300 group"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="p-2 rounded-full bg-muted-foreground/10 group-hover:bg-muted-foreground/20 transition-colors duration-300">
              <Plus className="h-5 w-5 text-muted-foreground" />
            </div>
            <span className="text-muted-foreground font-medium">Add New Flashcard</span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="p-4 rounded-lg border bg-card border-border transition-all duration-200 hover:shadow-md">
        <h3 className="font-medium text-card-foreground mb-4">Create New Flashcard</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="front" className="text-sm font-medium">Front</Label>
              <Textarea
                id="front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="What's the question or prompt?"
                className="h-20 resize-none border-input bg-background/50 focus:bg-background transition-colors duration-200"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="back" className="text-sm font-medium">Back</Label>
              <Textarea
                id="back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="What's the answer or explanation?"
                className="h-20 resize-none border-input bg-background/50 focus:bg-background transition-colors duration-200"
                required
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              className="px-4 hover:bg-muted/80 transition-colors duration-200"
              onClick={() => {
                setIsExpanded(false);
                setFront("");
                setBack("");
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium"
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Card
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

interface AddCardFormProps {
  onAdd: (front: string, back: string) => void;
}

export const AddCardForm = ({ onAdd }: AddCardFormProps) => {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (front.trim() && back.trim()) {
      onAdd(front.trim(), back.trim());
      setFront("");
      setBack("");
      setIsExpanded(false);
    }
  };

  if (!isExpanded) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Button
          onClick={() => setIsExpanded(true)}
          className="w-full h-64 border-2 border-dashed border-muted-foreground/30 bg-gradient-to-br from-muted/50 to-muted text-muted-foreground hover:border-primary hover:text-primary transition-all duration-300"
          variant="ghost"
        >
          <div className="flex flex-col items-center gap-2">
            <Plus className="h-8 w-8" />
            <span className="text-lg">Add New Flashcard</span>
          </div>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="h-64 bg-gradient-to-br from-card to-muted/30 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Create New Flashcard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="front" className="text-sm">Front</Label>
              <Textarea
                id="front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="Enter front text..."
                className="h-16 resize-none"
                required
              />
            </div>
            <div>
              <Label htmlFor="back" className="text-sm">Back</Label>
              <Textarea
                id="back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="Enter back text..."
                className="h-16 resize-none"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="flex-1">
                Add Card
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setIsExpanded(false);
                  setFront("");
                  setBack("");
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
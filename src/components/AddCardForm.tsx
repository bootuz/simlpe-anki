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
    <div className="w-full max-w-lg mx-auto">
      <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold">Create New Flashcard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="front" className="text-sm font-medium">Front</Label>
              <Textarea
                id="front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="What's the question or prompt?"
                className="min-h-[80px] resize-none border-input bg-background/50 focus:bg-background transition-colors duration-200"
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
                className="min-h-[80px] resize-none border-input bg-background/50 focus:bg-background transition-colors duration-200"
                required
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Card
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="px-6 hover:bg-muted/80 transition-colors duration-200"
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
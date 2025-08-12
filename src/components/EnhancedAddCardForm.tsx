import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Save, 
  X, 
  Tags,
  Sparkles 
} from "lucide-react";
import { validateCardContent, sanitizeCardContent } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";


interface EnhancedAddCardFormProps {
  onAdd: (front: string, back: string, tags: string[]) => void;
  isSubmitting?: boolean;
}

export const EnhancedAddCardForm = ({ onAdd, isSubmitting = false }: EnhancedAddCardFormProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isAddingTags, setIsAddingTags] = useState(false);
  const [tagInput, setTagInput] = useState("");
  
  const { toast } = useToast();

  // Auto-save draft to localStorage
  useEffect(() => {
    if (front || back || tags.length > 0) {
      const draft = { front, back, tags, timestamp: Date.now() };
      localStorage.setItem('cardDraft', JSON.stringify(draft));
    }
  }, [front, back, tags]);

  // Load draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('cardDraft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        const isRecent = Date.now() - draft.timestamp < 24 * 60 * 60 * 1000; // 24 hours
        if (isRecent && (draft.front || draft.back || draft.tags?.length > 0)) {
          setFront(draft.front || "");
          setBack(draft.back || "");
          setTags(draft.tags || []);
          toast({
            title: "Draft restored",
            description: "Your previous work has been restored",
          });
        }
      } catch (e) {
        console.error("Failed to load draft:", e);
      }
    }
  }, [toast]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem('cardDraft');
  }, []);


  const addTags = useCallback((tagInput: string) => {
    // Parse comma-separated tags
    const newTags = tagInput
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0 && !tags.includes(tag));
    
    if (newTags.length > 0) {
      setTags(prev => [...prev, ...newTags]);
    }
    
    // Reset input state
    setTagInput("");
    setIsAddingTags(false);
  }, [tags]);

  const removeTag = useCallback((tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  }, []);

  const handleTagInputKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (tagInput.trim()) {
        addTags(tagInput);
      }
    } else if (e.key === 'Escape') {
      setTagInput("");
      setIsAddingTags(false);
    }
  }, [tagInput, addTags]);

  const handleTagInputBlur = useCallback(() => {
    if (tagInput.trim()) {
      addTags(tagInput);
    } else {
      setTagInput("");
      setIsAddingTags(false);
    }
  }, [tagInput, addTags]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  }, [front, back, tags]);

  const handleSubmit = useCallback(() => {
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
    
    onAdd(sanitizedFront, sanitizedBack, tags);
    
    // Reset form
    setFront("");
    setBack("");
    setTags([]);
    setIsAddingTags(false);
    setTagInput("");
    setIsExpanded(false);
    clearDraft();
  }, [front, back, tags, onAdd, toast, clearDraft]);

  const handleCancel = useCallback(() => {
    setFront("");
    setBack("");
    setTags([]);
    setIsAddingTags(false);
    setTagInput("");
    setIsExpanded(false);
    clearDraft();
  }, [clearDraft]);

  if (!isExpanded) {
    return (
      <div className="w-full">
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full p-6 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 hover:bg-muted/40 hover:border-muted-foreground/50 transition-all duration-300 group"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 group-hover:from-purple-600/30 group-hover:to-blue-600/30 transition-all duration-300">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-center">
              <span className="text-muted-foreground font-medium text-lg">Create Enhanced Flashcard</span>
              <p className="text-sm text-muted-foreground/70 mt-1">Enhanced form with tags and better UX</p>
            </div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full" onKeyDown={handleKeyDown}>
      <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            <Edit3 className="h-5 w-5 text-purple-600" />
            Enhanced Card Creator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Main Content Editor */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="front" className="text-sm font-medium">Front</Label>
              <Textarea
                id="front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="What's the question or prompt?"
                className="h-32 resize-none border-input bg-background/50 focus:bg-background transition-colors duration-200"
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
                className="h-32 resize-none border-input bg-background/50 focus:bg-background transition-colors duration-200"
                required
              />
            </div>
          </div>

          {/* Tags Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Tags className="h-4 w-4" />
              Tags
            </Label>
            
            {/* Existing Tags + Add Button */}
            <div className="flex flex-wrap gap-2 items-center">
              {tags.map(tag => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1 bg-purple-100 text-purple-800 hover:bg-purple-200"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-purple-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              
              {/* Expandable Tag Input */}
              {!isAddingTags ? (
                <button
                  onClick={() => setIsAddingTags(true)}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground border border-dashed border-muted-foreground/30 hover:border-muted-foreground/60 rounded-md hover:bg-muted/50 transition-colors duration-200"
                >
                  <Plus className="h-3 w-3" />
                  Add Tags
                </button>
              ) : (
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  onBlur={handleTagInputBlur}
                  placeholder="tag1, tag2, tag3..."
                  className="h-7 text-xs min-w-32 max-w-48 border-muted-foreground/60"
                  autoFocus
                />
              )}
            </div>
            
            {isAddingTags && (
              <div className="text-xs text-muted-foreground">
                💡 Separate multiple tags with commas. Press Enter to save or Escape to cancel.
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-border/50">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!front.trim() || !back.trim() || isSubmitting}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Card
                </>
              )}
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            💡 Tip: Press Ctrl/Cmd + Enter to save quickly
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
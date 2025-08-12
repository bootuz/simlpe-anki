import React, { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  X, 
  Save, 
  Tags, 
  Sparkles,
  Plus 
} from "lucide-react";
import { validateCardContent } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";


interface EnhancedAddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (front: string, back: string, tags: string[], closeModal?: boolean) => void;
  deckName?: string;
  isSubmitting?: boolean;
}

export const EnhancedAddCardModal = ({
  isOpen,
  onClose,
  onSubmit,
  deckName,
  isSubmitting = false
}: EnhancedAddCardModalProps) => {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isAddingTags, setIsAddingTags] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const frontInputRef = useRef<HTMLTextAreaElement>(null);
  
  const { toast } = useToast();

  // Auto-save draft to localStorage
  useEffect(() => {
    if (isOpen && (front || back || tags.length > 0)) {
      const draft = { front, back, tags, timestamp: Date.now() };
      localStorage.setItem('cardModalDraft', JSON.stringify(draft));
    }
  }, [front, back, tags, isOpen]);

  // Load draft when modal opens
  useEffect(() => {
    if (isOpen) {
      const savedDraft = localStorage.getItem('cardModalDraft');
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
    }
  }, [isOpen, toast]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem('cardModalDraft');
  }, []);

  const resetForm = useCallback(() => {
    setFront("");
    setBack("");
    setTags([]);
    setIsAddingTags(false);
    setTagInput("");
    clearDraft();
  }, [clearDraft]);

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

  const handleSubmit = useCallback((shouldCloseModal = true) => {
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
    
    onSubmit(front.trim(), back.trim(), tags, shouldCloseModal);
    
    if (!shouldCloseModal) {
      // Keep modal open but reset form for next card
      setFront("");
      setBack("");
      setTags([]);
      setIsAddingTags(false);
      setTagInput("");
      clearDraft();
      
      // Focus the front input for the next card
      setTimeout(() => {
        frontInputRef.current?.focus();
      }, 50);
      
      toast({
        title: "Card created!",
        description: "Ready to create another card",
      });
    } else {
      // Reset form when closing modal
      resetForm();
    }
  }, [front, back, tags, onSubmit, toast, resetForm, clearDraft]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(false); // Keep modal open for continuous card creation
    }
    if (e.key === 'Escape') {
      handleClose();
    }
  }, [handleSubmit, handleClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-md border-border/50"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Enhanced Card Creator
          </DialogTitle>
          <p className="text-muted-foreground">
            Create a rich flashcard for your <span className="font-semibold text-primary">{deckName}</span> deck
          </p>
        </DialogHeader>

        <div className="space-y-6">

          {/* Main Content Editor */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Front of Card</Label>
              <Textarea
                ref={frontInputRef}
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="What's the question or prompt?"
                className="h-32 resize-none border-input bg-background/50 focus:bg-background transition-colors duration-200"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Back of Card</Label>
              <Textarea
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
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => handleSubmit(true)}
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
            💡 Tip: Press Ctrl/Cmd + Enter to save and create another card
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
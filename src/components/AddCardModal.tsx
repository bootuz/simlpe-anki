import React, { memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  frontText: string;
  backText: string;
  onFrontChange: (text: string) => void;
  onBackChange: (text: string) => void;
  onSubmit: () => void;
  deckName?: string;
  isSubmitting?: boolean;
}

const AddCardModal = memo(({
  isOpen,
  onClose,
  frontText,
  backText,
  onFrontChange,
  onBackChange,
  onSubmit,
  deckName,
  isSubmitting = false
}: AddCardModalProps) => {
  const handleSubmit = () => {
    if (frontText.trim() && backText.trim()) {
      onSubmit();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-md border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Add New Card
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a new flashcard for your <span className="font-semibold text-primary">{deckName}</span> deck.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4" onKeyDown={handleKeyDown}>
          <div className="space-y-2">
            <label htmlFor="card-front" className="text-sm font-medium">
              Front of card
            </label>
            <Textarea
              id="card-front"
              placeholder="Enter the question or prompt..."
              value={frontText}
              onChange={(e) => onFrontChange(e.target.value)}
              className="min-h-[100px] resize-none"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="card-back" className="text-sm font-medium">
              Back of card
            </label>
            <Textarea
              id="card-back"
              placeholder="Enter the answer or explanation..."
              value={backText}
              onChange={(e) => onBackChange(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!frontText.trim() || !backText.trim() || isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Card'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

AddCardModal.displayName = "AddCardModal";

export default AddCardModal;
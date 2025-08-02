import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, BookOpen, Layers3 } from "lucide-react";

interface EmptyStateProps {
  type: 'no-folders' | 'no-decks' | 'no-cards';
  onAction?: () => void;
  actionLabel?: string;
}

export const EmptyState = ({ type, onAction, actionLabel }: EmptyStateProps) => {
  const getEmptyStateContent = () => {
    switch (type) {
      case 'no-folders':
        return {
          icon: <Layers3 className="h-12 w-12 text-muted-foreground/50" />,
          title: "No folders yet",
          description: "Create your first folder to organize your flashcard decks",
          actionText: actionLabel || "Create Folder"
        };
      case 'no-decks':
        return {
          icon: <BookOpen className="h-12 w-12 text-muted-foreground/50" />,
          title: "No decks in this folder",
          description: "Add a deck to start creating flashcards for this topic",
          actionText: actionLabel || "Create Deck"
        };
      case 'no-cards':
        return {
          icon: <Plus className="h-12 w-12 text-muted-foreground/50" />,
          title: "No cards yet",
          description: "Add your first flashcard to start studying",
          actionText: actionLabel || "Add Card"
        };
      default:
        return {
          icon: <BookOpen className="h-12 w-12 text-muted-foreground/50" />,
          title: "Nothing here",
          description: "Get started by creating some content",
          actionText: "Get Started"
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <Card className="border-dashed border-2 border-muted-foreground/25 bg-muted/30">
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <div className="p-4 rounded-full bg-muted/50">
          {content.icon}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            {content.title}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {content.description}
          </p>
        </div>

        {onAction && (
          <Button 
            onClick={onAction}
            className="mt-4"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            {content.actionText}
          </Button>
        )}
      </div>
    </Card>
  );
};
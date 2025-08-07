import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

interface CaughtUpProps {
  onManageDecks: () => void;
}

export default function CaughtUp({ onManageDecks }: CaughtUpProps) {
  return (
    <section className="text-center py-16 animate-fade-in">
      <div className="max-w-md mx-auto">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <BookOpen className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-4">All Caught Up! 🎉</h2>
        <p className="text-muted-foreground mb-8">Great job! You've reviewed all the cards due today. Check back later for more reviews.</p>
        <div className="flex justify-center">
          <Button variant="outline" onClick={onManageDecks}>Add More Cards</Button>
        </div>
      </div>
    </section>
  );
}

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Zap, Clock, Folder } from "lucide-react";

type Card = {
  id: string;
  front: string;
  deck_name: string;
  folder_name: string;
  due_date: string | null;
};

type DueInfo = {
  status: "new" | "overdue" | "due-today" | "future";
  label: string;
  daysUntilDue?: number;
};

interface StudyReadyProps {
  cards: Card[];
  getDueDateStatus: (due: string | null) => DueInfo;
  onStartStudy: () => void;
}

export default function StudyReady({ cards, getDueDateStatus, onStartStudy }: StudyReadyProps) {
  const newCount = cards.filter((c) => getDueDateStatus(c.due_date).status === "new").length;
  const dueToday = cards.filter((c) => getDueDateStatus(c.due_date).status === "due-today").length;
  const overdue = cards.filter((c) => getDueDateStatus(c.due_date).status === "overdue").length;

  return (
    <section className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
          <BookOpen className="h-10 w-10 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-2">Ready to Study!</h2>
          <p className="text-lg text-muted-foreground mb-6">
            You have <span className="font-semibold text-primary">{cards.length}</span> cards ready for review
          </p>
        </div>
        <Button onClick={onStartStudy} size="lg" className="px-8 py-6 text-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-primary/25">
          <Zap className="h-6 w-6 mr-2" />
          Start Studying Now
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-primary">{newCount}</div>
          <div className="text-sm text-muted-foreground">New</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold">{dueToday}</div>
          <div className="text-sm text-muted-foreground">Due Today</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-destructive">{overdue}</div>
          <div className="text-sm text-muted-foreground">Overdue</div>
        </div>
      </div>

      {/* Queue */}
      <div className="space-y-6">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Study Queue</h3>
              <p className="text-sm text-muted-foreground">Prioritized by urgency</p>
            </div>
          </div>
          <Badge variant="secondary" className="px-3 py-1">{cards.length} cards</Badge>
        </div>

        <div className="space-y-3 max-w-4xl mx-auto">
          {cards.slice(0, 8).map((card) => {
            const { status, label } = getDueDateStatus(card.due_date);

            return (
              <div key={card.id} className="group relative bg-card border rounded-xl p-4 hover:bg-muted transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge
                        variant={status === "overdue" ? "destructive" : status === "new" ? "default" : "secondary"}
                        className="text-xs shrink-0"
                      >
                        {status === "new" ? "New" : status === "overdue" ? "Overdue" : "Due"}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground/80">
                        <Folder className="h-3 w-3" />
                        <span className="font-medium">{card.folder_name}</span>
                        <span>/</span>
                        <BookOpen className="h-3 w-3" />
                        <span className="font-medium">{card.deck_name}</span>
                      </div>
                    </div>
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors text-base truncate">
                      {card.front}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 ml-6">
                    <span className="text-sm text-muted-foreground whitespace-nowrap font-medium">{label}</span>
                  </div>
                </div>
              </div>
            );
          })}
          {cards.length > 8 && (
            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">And {cards.length - 8} more cards waiting...</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

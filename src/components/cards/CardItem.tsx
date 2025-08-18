import React, { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Clock, Trash2, MoreHorizontal, Edit, Sparkles } from "lucide-react";
import { getDueDateInfo, getDueDateStatusClass } from "@/utils/fsrsUtils";

interface CardData {
  id: string;
  front: string;
  back: string;
  deck_id: string;
  created_at: string;
  updated_at: string;
  state?: string;
  due_date?: string;
}

interface CardItemProps {
  card: CardData;
  isSelected: boolean;
  onSelect: (cardId: string) => void;
  onEdit: (cardId: string, front: string, back: string) => void;
  onDelete: (cardId: string) => void;
  onStudy: () => void;
  getStateBadgeColor: (state?: string) => string;
}

const CardItem = memo(({
  card,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onStudy,
  getStateBadgeColor
}: CardItemProps) => {
  return (
    <Card 
      className={`
        group relative transition-all duration-200 hover:shadow-lg hover:shadow-primary/8 cursor-pointer min-h-[140px] bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/30 hover:scale-[1.01]
        ${isSelected 
          ? 'ring-2 ring-primary bg-primary/10 shadow-lg shadow-primary/15 scale-[1.01]' 
          : ''
        }
      `}
      onClick={() => onSelect(card.id)}
    >
      {/* Glass morphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
      
      {/* Selection indicator - Checkbox style */}
      <div className={`
        absolute top-4 left-4 w-4 h-4 rounded-md border-2 transition-all duration-150 flex items-center justify-center
        ${isSelected 
          ? 'bg-primary border-primary' 
          : 'border-muted-foreground/30 group-hover:border-primary/50'
        }
      `}>
        {isSelected && (
          <svg 
            className="w-3 h-3 text-primary-foreground animate-scale-in" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={3} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        )}
      </div>

      <CardContent className="p-4 pl-10">
        <div className="space-y-3">
          {/* Header with title, badge, and actions */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-card-foreground leading-tight line-clamp-2 flex-1">
                {card.front}
              </h3>
              <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                {card.state && (
                  <Badge 
                    variant="secondary"
                    className={`text-xs h-5 ${getStateBadgeColor(card.state)}`}
                  >
                    {card.state}
                  </Badge>
                )}
                <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="w-32 bg-background border shadow-xl z-[100]" 
                      sideOffset={5}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(card.id, card.front, card.back);
                        }}
                        className="cursor-pointer"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(card.id);
                        }}
                        className="text-destructive cursor-pointer focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>

          {/* Back content preview - only visible on hover */}
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-xs text-muted-foreground/80 line-clamp-2 border-l-2 border-muted pl-3">
            <span className="font-medium text-muted-foreground">Answer:</span> {card.back}
          </div>

          {/* Footer with progress and due date */}
          <div className="pt-2 border-t border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Due date with enhanced styling */}
              {card.due_date ? (
                <div className={`text-xs flex items-center gap-1.5 font-medium ${getDueDateStatusClass(getDueDateInfo(card.due_date))}`}>
                  <Clock className="h-3 w-3" />
                  <span>
                    {getDueDateInfo(card.due_date).label}
                  </span>
                </div>
              ) : (
                <div className="text-xs flex items-center gap-1.5 text-muted-foreground/60">
                  <Sparkles className="h-3 w-3" />
                  <span>New card</span>
                </div>
              )}
            </div>

            {/* Quick study action */}
            {card.due_date && new Date(card.due_date) <= new Date() && (
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-xs px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  onStudy();
                }}
              >
                Study Now
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

CardItem.displayName = "CardItem";

export default CardItem;
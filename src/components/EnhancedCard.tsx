import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash2, Edit, MoreHorizontal, Calendar, Clock } from "lucide-react";
import { getDueDateInfo, getDueDateStatusClass } from "@/utils/fsrsUtils";

interface EnhancedCardProps {
  id: string;
  front: string;
  back: string;
  state?: string;
  due_date?: string;
  created_at: string;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, front: string, back: string) => void;
}

export const EnhancedCard = ({
  id,
  front,
  back,
  state,
  due_date,
  created_at,
  isSelected,
  onSelect,
  onDelete,
  onEdit,
}: EnhancedCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editFront, setEditFront] = useState(front);
  const [editBack, setEditBack] = useState(back);

  const handleSave = () => {
    onEdit(id, editFront, editBack);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditFront(front);
    setEditBack(back);
    setIsEditing(false);
  };

  const getStateVariant = (state: string) => {
    switch (state?.toLowerCase()) {
      case 'new': return 'new';
      case 'learning': return 'learning';
      case 'review': return 'review';
      case 'relearning': return 'relearning';
      default: return 'default';
    }
  };

  const getStateBadgeColor = (state: string) => {
    switch (state?.toLowerCase()) {
      case 'new': 
        return 'bg-green-500/10 text-green-600 border-green-500/20 dark:bg-green-500/20 dark:text-green-400';
      case 'learning': 
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400';
      case 'review': 
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:bg-purple-500/20 dark:text-purple-400';
      case 'relearning': 
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20 dark:bg-orange-500/20 dark:text-orange-400';
      default: 
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20 dark:bg-gray-500/20 dark:text-gray-400';
    }
  };

  const getDueDateColor = (due_date: string) => {
    if (!due_date) return '';
    
    const dueDateInfo = getDueDateInfo(due_date);
    const statusClass = getDueDateStatusClass(dueDateInfo);
    
    if (statusClass.includes('text-red')) return 'text-red-600 dark:text-red-400';
    if (statusClass.includes('text-orange')) return 'text-orange-600 dark:text-orange-400';
    if (statusClass.includes('text-blue')) return 'text-blue-600 dark:text-blue-400';
    return 'text-muted-foreground';
  };

  return (
    <Card 
      className={`group relative transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
        isSelected 
          ? 'ring-2 ring-primary shadow-lg bg-primary/5' 
          : 'hover:shadow-md border-border/50'
      } ${isEditing ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}
    >
      <div className="p-4 space-y-3">
        {/* Header with selection and actions */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelect(id, checked as boolean)}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <div className="flex items-center gap-2">
              {state && (
                <Badge 
                  variant="outline" 
                  className={`px-2 py-0.5 text-xs font-medium border ${getStateBadgeColor(state)}`}
                >
                  {state}
                </Badge>
              )}
              {due_date && (
                <div className={`flex items-center gap-1 text-xs ${getDueDateColor(due_date)}`}>
                  <Clock className="h-3 w-3" />
                  {getDueDateInfo(due_date).label}
                </div>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
              Front
            </div>
            {isEditing ? (
              <Textarea
                value={editFront}
                onChange={(e) => setEditFront(e.target.value)}
                className="min-h-[60px] resize-none"
                placeholder="Enter front text..."
              />
            ) : (
              <div className="text-sm font-medium leading-relaxed text-foreground min-h-[60px] flex items-center">
                {front}
              </div>
            )}
          </div>

          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
              Back
            </div>
            {isEditing ? (
              <Textarea
                value={editBack}
                onChange={(e) => setEditBack(e.target.value)}
                className="min-h-[60px] resize-none"
                placeholder="Enter back text..."
              />
            ) : (
              <div className="text-sm leading-relaxed text-muted-foreground min-h-[60px] flex items-center">
                {back}
              </div>
            )}
          </div>
        </div>

        {/* Edit actions */}
        {isEditing && (
          <div className="flex gap-2 pt-2 border-t">
            <Button variant="default" size="sm" onClick={handleSave}>
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        )}

        {/* Created date */}
        {!isEditing && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t border-border/50">
            <Calendar className="h-3 w-3" />
            Created {new Date(created_at).toLocaleDateString()}
          </div>
        )}
      </div>
    </Card>
  );
};
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";

interface FlashCardProps {
  id: string;
  front: string;
  back: string;
  onDelete: (id: string) => void;
  onEdit: (id: string, front: string, back: string) => void;
}

export const FlashCard = ({ id, front, back, onDelete, onEdit }: FlashCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFront, setEditFront] = useState(front);
  const [editBack, setEditBack] = useState(back);

  const handleFlip = () => {
    if (!isEditing) {
      setIsFlipped(!isFlipped);
    }
  };

  const handleSave = () => {
    onEdit(id, editFront, editBack);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditFront(front);
    setEditBack(back);
    setIsEditing(false);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div 
        className={`relative w-full h-64 cursor-pointer transition-transform duration-700 transform-gpu preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={handleFlip}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front of card */}
        <Card className={`absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-flashcard-front to-flashcard-back text-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 ${
          isFlipped ? 'opacity-0' : 'opacity-100'
        }`}>
          <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm opacity-80">Front</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-red-500/20 h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              {isEditing ? (
                <textarea
                  value={editFront}
                  onChange={(e) => setEditFront(e.target.value)}
                  className="w-full h-full bg-white/10 border border-white/20 rounded p-3 text-white placeholder-white/60 resize-none"
                  placeholder="Enter front text..."
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <p className="text-lg text-center leading-relaxed">{front}</p>
              )}
            </div>
            {isEditing && (
              <div className="flex gap-2 mt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave();
                  }}
                >
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancel();
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Back of card */}
        <Card className={`absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-accent to-flashcard-back text-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 rotate-y-180 ${
          isFlipped ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm opacity-80">Back</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                    setIsFlipped(false);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-red-500/20 h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              {isEditing ? (
                <textarea
                  value={editBack}
                  onChange={(e) => setEditBack(e.target.value)}
                  className="w-full h-full bg-white/10 border border-white/20 rounded p-3 text-white placeholder-white/60 resize-none"
                  placeholder="Enter back text..."
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <p className="text-lg text-center leading-relaxed">{back}</p>
              )}
            </div>
            {isEditing && (
              <div className="flex gap-2 mt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave();
                  }}
                >
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancel();
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
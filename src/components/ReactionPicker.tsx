import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ReactionType = 'spark' | 'fire' | 'clap' | 'laugh' | 'bloom';

export interface Reaction {
  type: ReactionType;
  emoji: string;
  label: string;
  color: string;
}

export const REACTIONS: Reaction[] = [
  { type: 'spark', emoji: '✨', label: 'Spark', color: 'text-yellow-400' },
  { type: 'fire', emoji: '🔥', label: 'Fire', color: 'text-orange-500' },
  { type: 'clap', emoji: '👏', label: 'Clap', color: 'text-amber-600' },
  { type: 'laugh', emoji: '😂', label: 'Laugh', color: 'text-blue-500' },
  { type: 'bloom', emoji: '🌸', label: 'Bloom', color: 'text-pink-500' },
];

interface ReactionPickerProps {
  userReaction?: ReactionType | null;
  reactionCounts: Record<ReactionType, number>;
  totalCount: number;
  onReaction: (type: ReactionType) => void;
  onRemoveReaction: () => void;
  className?: string;
}

export const ReactionPicker = ({
  userReaction,
  reactionCounts,
  totalCount,
  onReaction,
  onRemoveReaction,
  className
}: ReactionPickerProps) => {
  const [showPicker, setShowPicker] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [isAnimating, setIsAnimating] = useState<ReactionType | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
        setShowBreakdown(false);
      }
    };

    if (showPicker || showBreakdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPicker, showBreakdown]);

  const handleLongPress = () => {
    setShowPicker(true);
  };

  const handleQuickTap = () => {
    if (userReaction) {
      onRemoveReaction();
    } else {
      // Default reaction is 'spark'
      onReaction('spark');
      triggerAnimation('spark');
    }
  };

  const handleReactionSelect = (type: ReactionType) => {
    onReaction(type);
    setShowPicker(false);
    triggerAnimation(type);
  };

  const triggerAnimation = (type: ReactionType) => {
    setIsAnimating(type);
    setTimeout(() => setIsAnimating(null), 600);
  };

  const handleMouseDown = () => {
    timeoutRef.current = setTimeout(handleLongPress, 500);
  };

  const handleMouseUp = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      if (!showPicker) {
        handleQuickTap();
      }
    }
  };

  const handleTouchStart = () => {
    timeoutRef.current = setTimeout(handleLongPress, 500);
  };

  const handleTouchEnd = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      if (!showPicker) {
        handleQuickTap();
      }
    }
  };

  const getUserReactionEmoji = () => {
    if (!userReaction) return '✨';
    return REACTIONS.find(r => r.type === userReaction)?.emoji || '✨';
  };

  const getAnimationClass = (type: ReactionType) => {
    if (isAnimating !== type) return '';
    
    switch (type) {
      case 'spark':
        return 'animate-pulse';
      case 'fire':
        return 'animate-bounce';
      case 'clap':
        return 'animate-pulse';
      case 'laugh':
        return 'animate-bounce';
      case 'bloom':
        return 'animate-pulse';
      default:
        return '';
    }
  };

  return (
    <div className={cn("relative", className)} ref={pickerRef}>
      {/* Main reaction button */}
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "transition-all duration-200",
          userReaction && "text-primary"
        )}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onContextMenu={(e) => e.preventDefault()}
      >
        <span 
          className={cn(
            "text-base mr-1 transition-transform duration-200",
            userReaction && getAnimationClass(userReaction)
          )}
        >
          {getUserReactionEmoji()}
        </span>
        <span 
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setShowBreakdown(!showBreakdown);
          }}
        >
          {totalCount}
        </span>
      </Button>

      {/* Reaction picker popup */}
      {showPicker && (
        <div className="absolute bottom-full left-0 mb-2 bg-popover border rounded-lg shadow-lg p-2 flex gap-1 z-50 animate-scale-in">
          {REACTIONS.map((reaction) => (
            <Button
              key={reaction.type}
              variant="ghost"
              size="sm"
              className={cn(
                "h-10 w-10 p-0 hover:scale-110 transition-transform duration-200",
                reaction.color
              )}
              onClick={() => handleReactionSelect(reaction.type)}
            >
              <span className="text-lg">{reaction.emoji}</span>
            </Button>
          ))}
        </div>
      )}

      {/* Reaction breakdown popup */}
      {showBreakdown && totalCount > 0 && (
        <div className="absolute bottom-full left-0 mb-2 bg-popover border rounded-lg shadow-lg p-3 z-50 animate-scale-in min-w-32">
          <div className="space-y-1">
            {REACTIONS.map((reaction) => {
              const count = reactionCounts[reaction.type] || 0;
              if (count === 0) return null;
              
              return (
                <div key={reaction.type} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span>{reaction.emoji}</span>
                    <span className="text-muted-foreground">{reaction.label}</span>
                  </div>
                  <span className="font-medium">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Animation overlay */}
      {isAnimating && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <span 
            className={cn(
              "text-2xl animate-ping opacity-75",
              REACTIONS.find(r => r.type === isAnimating)?.color
            )}
          >
            {REACTIONS.find(r => r.type === isAnimating)?.emoji}
          </span>
        </div>
      )}
    </div>
  );
};
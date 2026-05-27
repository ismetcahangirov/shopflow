'use client';

import * as React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StarRatingProps {
  rating: number;
  maxStars?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({
  rating,
  maxStars = 5,
  interactive = false,
  onChange,
  className,
  size = 'md',
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const handleMouseEnter = (index: number) => {
    if (!interactive) return;
    setHoverRating(index);
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    setHoverRating(null);
  };

  const handleClick = (index: number) => {
    if (!interactive || !onChange) return;
    onChange(index);
  };

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  const displayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div
      className={cn('flex items-center gap-0.5', className)}
      onMouseLeave={handleMouseLeave}
      data-testid="star-rating"
    >
      {[...Array(maxStars)].map((_, i) => {
        const starValue = i + 1;
        // Calculate fill percentage for partial stars when not interactive
        let fillType: 'full' | 'half' | 'empty' = 'empty';
        
        if (interactive) {
          fillType = starValue <= displayRating ? 'full' : 'empty';
        } else {
          if (rating >= starValue) {
            fillType = 'full';
          } else if (rating >= starValue - 0.5) {
            fillType = 'half';
          }
        }

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            className={cn(
              'focus:outline-none transition-transform duration-150',
              interactive ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'
            )}
            aria-label={`Rate ${starValue} stars out of ${maxStars}`}
          >
            <div className="relative">
              {fillType === 'half' ? (
                <>
                  <Star className={cn('text-slate-200 dark:text-slate-800', sizeClasses[size])} />
                  <div className="absolute top-0 left-0 overflow-hidden w-1/2">
                    <Star
                      className={cn(
                        'text-amber-400 fill-amber-400',
                        sizeClasses[size]
                      )}
                    />
                  </div>
                </>
              ) : (
                <Star
                  className={cn(
                    fillType === 'full'
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-250 dark:text-slate-700',
                    sizeClasses[size]
                  )}
                />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

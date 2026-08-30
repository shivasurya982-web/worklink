import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating = 0, totalReviews, size = 'sm', interactive = false, onChange }) => {
  const sizes = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <div className="flex items-center gap-0.5 shrink-0">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          >
            <Star
              className={`${sizes[size]} ${
                star <= Math.round(rating)
                  ? 'fill-accent-gold text-accent-gold'
                  : 'fill-gray-100 text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>

      {rating > 0 && !interactive && (
        <span className="text-xs font-semibold text-text-primary ml-0.5 shrink-0 inline-flex items-center">
          {Number(rating).toFixed(1)}
          {totalReviews !== undefined && (
            <span className="text-text-muted font-normal ml-0.5">({totalReviews})</span>
          )}
        </span>
      )}
    </div>
  );
};

export default RatingStars;

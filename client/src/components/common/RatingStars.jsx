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
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 shrink-0">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-125 transition-all duration-300' : 'cursor-default'}`}
          >
            <Star
              className={`${sizes[size]} transition-all duration-500 ${
                star <= Math.round(rating)
                  ? 'fill-accent-bright text-accent-bright drop-shadow-[0_0_5px_rgba(255,122,24,0.4)]'
                  : 'fill-background-dark text-white/10'
              }`}
            />
          </button>
        ))}
      </div>

      {rating > 0 && !interactive && (
        <div className="inline-flex items-center gap-1.5 ml-1">
          <span className="text-xs font-black text-white px-2 py-0.5 rounded-lg bg-background-widget border border-white/5 shadow-xl">
            {Number(rating).toFixed(1)}
          </span>
          {totalReviews !== undefined && (
            <span className="text-[10px] font-black text-text-muted uppercase tracking-tighter opacity-60">
              | {totalReviews} AUDITS
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default RatingStars;

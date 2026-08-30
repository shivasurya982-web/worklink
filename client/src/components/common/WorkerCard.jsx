import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, MapPin, Heart, Clock } from 'lucide-react';
import GlassCard from './GlassCard';
import RatingStars from './RatingStars';
import Badge from './Badge';
import PremiumButton from './PremiumButton';

const WorkerCard = ({ worker, isFavorite = false, onToggleFavorite, onBook, compact = false }) => {
  const {
    _id,
    name,
    profession,
    avatar,
    rating = 0,
    totalReviews = 0,
    experience = 0,
    pricing,
    isVerified,
    isAvailable,
    matchPercentage,
    distance,
  } = worker;

  const avatarUrl =
    avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=D4AF37&color=fff`;

  return (
    <GlassCard goldBorder className="relative flex flex-col justify-between h-full group">

      {/* ── Top Row: Avatar + Badges ── */}
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="relative shrink-0">
          <img
            src={avatarUrl}
            alt={name}
            loading="lazy"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-accent-gold/40 shadow-sm group-hover:scale-105 transition-transform"
          />
          {isAvailable && (
            <span
              className="absolute bottom-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-accent-green border-2 border-white rounded-full"
              title="Available Now"
              aria-label="Available Now"
            />
          )}
        </div>

        <div className="flex flex-col items-end gap-1.5 min-w-0 ml-2">
          {isVerified && (
            <Badge variant="verified" size="xs">
              <CheckCircle2 className="w-3 h-3 text-accent-gold" /> Verified
            </Badge>
          )}
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(_id)}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-text-muted hover:text-accent-red"
              aria-label={isFavorite ? 'Remove from favourites' : 'Add to favourites'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-accent-red text-accent-red' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* ── Worker Info ── */}
      <div className="flex-1 mb-3 sm:mb-4">
        <Link to={`/workers/${_id}`} className="hover:underline block">
          <h4 className="font-sora font-semibold text-sm sm:text-base text-text-primary line-clamp-1 leading-tight">
            {name}
          </h4>
        </Link>
        <p className="text-xs font-medium text-text-secondary mb-2 leading-tight">{profession}</p>

        <div className="w-full overflow-hidden">
          <RatingStars rating={rating} totalReviews={totalReviews} size="xs" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-2.5 sm:mt-3 text-xs text-text-secondary bg-gray-50/80 rounded-xl p-2 sm:p-2.5 border border-gray-100">
          <div>
            <span className="text-text-muted text-[10px]">Experience</span>
            <div className="font-semibold text-text-primary">{experience} yrs</div>
          </div>
          <div>
            <span className="text-text-muted text-[10px]">Rate</span>
            <div className="font-semibold text-accent-gold">
              {pricing?.currency || '₹'}{pricing?.hourly || 0}/hr
            </div>
          </div>
          {(worker.address?.street || worker.address?.city || (distance !== undefined && distance !== null)) && (
            <div className="col-span-2 flex items-center gap-1 text-text-muted text-[11px] pt-1 border-t border-gray-100 mt-1 truncate">
              <MapPin className="w-3 h-3 text-accent-gold shrink-0" />
              <span className="truncate">
                {[worker.address?.street, worker.address?.city].filter(Boolean).join(', ') || `${distance} km away`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 pt-2 sm:pt-3 border-t border-gray-100">
        <Link to={`/workers/${_id}`} className="min-h-[40px] flex">
          <PremiumButton variant="outline" size="sm" fullWidth className="flex-1">
            Profile
          </PremiumButton>
        </Link>
        <PremiumButton
          variant="gold"
          size="sm"
          fullWidth
          onClick={() => onBook && onBook(worker)}
          className="min-h-[40px]"
        >
          Book Now
        </PremiumButton>
      </div>
    </GlassCard>
  );
};

export default WorkerCard;

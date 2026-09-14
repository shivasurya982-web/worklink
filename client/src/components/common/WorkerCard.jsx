import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, MapPin, Heart, Star, Briefcase } from 'lucide-react';
import GlassCard from './GlassCard';
import RatingStars from './RatingStars';
import Badge from './Badge';
import PremiumButton from './PremiumButton';

const WorkerCard = ({ worker, isFavorite = false, onToggleFavorite, onBook }) => {
  const navigate = useNavigate();
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
    distance,
  } = worker;

  const avatarUrl = avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=F4510B&color=fff`;

  return (
    <GlassCard goldBorder className="relative flex flex-col justify-between h-full group !bg-background-card border-border-primary/60 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">

      {/* Top Section */}
      <div className="flex items-start justify-between mb-6">
        <div className="relative shrink-0">
          <img
            src={avatarUrl}
            alt={name}
            loading="lazy"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-[1.2rem] object-cover border-2 border-accent-main shadow-2xl group-hover:scale-105 transition-all duration-500"
          />
          {isAvailable && (
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent-green border-4 border-background-card rounded-xl shadow-xl" />
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          {isVerified && <Badge variant="verified" size="xs" className="!rounded-lg">VERIFIED</Badge>}
          {onToggleFavorite && (
            <button
              onClick={(e) => { e.preventDefault(); onToggleFavorite(_id); }}
              className="p-2 rounded-xl bg-background-cardSecondary border border-white/5 hover:border-accent-red transition-all text-text-muted hover:text-accent-red"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-accent-red text-accent-red shadow-lg' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="flex-1 mb-6">
        <h4 className="font-sora font-black text-base text-white line-clamp-1 leading-tight group-hover:text-accent-bright transition-colors uppercase tracking-tight">
          {name}
        </h4>
        <p className="text-[10px] font-black text-accent-light uppercase tracking-widest mt-1 opacity-90">{profession}</p>

        <div className="mt-4">
          <RatingStars rating={rating} totalReviews={totalReviews} size="xs" />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6 text-[10px] font-black text-text-secondary bg-background-cardSecondary/60 rounded-2xl p-4 border border-border-primary/20 shadow-inner">
          <div className="space-y-1">
            <p className="text-text-muted uppercase tracking-widest opacity-60">Experience</p>
            <p className="text-white">{experience} Yrs</p>
          </div>
          <div className="space-y-1">
            <p className="text-text-muted uppercase tracking-widest opacity-60">Pricing</p>
            <p className="text-accent-bright leading-tight">Price Varies by Work</p>
          </div>
          {(worker.address?.city || distance) && (
            <div className="col-span-2 flex items-center gap-2 text-text-muted border-t border-white/5 pt-2 mt-1">
              <MapPin className="w-3 h-3 text-accent-bright" />
              <span className="truncate uppercase tracking-tighter opacity-80">{worker.address?.city || `${distance} KM`}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
        <button
          onClick={() => navigate(`/workers/${_id}`)}
          className="flex-1 py-3 rounded-xl border border-border-primary/40 text-[10px] font-black text-white hover:bg-white/5 uppercase tracking-widest transition-all"
        >
          PROFILE
        </button>
        <button
          onClick={() => onBook && onBook(worker)}
          className="flex-1 py-3 rounded-xl bg-accent-orange text-white text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-accent-bright hover:-translate-y-1 transition-all border border-accent-highlight/30"
        >
          BOOK NOW
        </button>
      </div>
    </GlassCard>
  );
};

export default WorkerCard;

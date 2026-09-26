import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Heart } from 'lucide-react';
import GlassCard from './GlassCard';
import RatingStars from './RatingStars';
import Badge from './Badge';
import { getImageUrl, handleImageError, DEFAULT_AVATAR } from '../../utils/imageUtils';

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
    isVerified,
    isAvailable,
    distance,
  } = worker;

  const fallbackAvatar = DEFAULT_AVATAR(name);
  const avatarUrl = getImageUrl(avatar, fallbackAvatar);

  return (
    <GlassCard goldBorder className="relative flex flex-col justify-between h-full group !bg-white/70 border border-white/60 shadow-sm hover:shadow-md transition-all">

      {/* Top Section */}
      <div className="flex items-start justify-between mb-5">
        <div className="relative shrink-0">
          <img
            src={avatarUrl}
            alt={name}
            loading="lazy"
            onError={(e) => handleImageError(e, fallbackAvatar)}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-[1.2rem] object-cover border-2 border-accent-main shadow-md group-hover:scale-105 transition-all duration-300"
          />
          {isAvailable && (
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          {isVerified && <Badge variant="verified" size="xs" className="!rounded-lg">VERIFIED</Badge>}
          {onToggleFavorite && (
            <button
              onClick={(e) => { e.preventDefault(); onToggleFavorite(_id); }}
              className="p-2 rounded-xl bg-white/80 border border-gray-200 hover:border-red-400 transition-all text-gray-400 hover:text-red-500 shadow-sm"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="flex-1 mb-5">
        <h4 className="font-sora font-black text-base text-text-primary line-clamp-1 leading-tight group-hover:text-accent-main transition-colors uppercase tracking-tight">
          {name}
        </h4>
        <p className="text-[10px] font-bold text-accent-main uppercase tracking-widest mt-1">{profession}</p>

        <div className="mt-3">
          <RatingStars rating={rating} totalReviews={totalReviews} size="xs" />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-5 text-[10px] font-bold text-text-secondary bg-blue-50/50 rounded-2xl p-3.5 border border-blue-100/60">
          <div className="space-y-0.5">
            <p className="text-text-muted uppercase tracking-widest text-[9px]">Experience</p>
            <p className="text-text-primary font-black">{experience} Yrs</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-text-muted uppercase tracking-widest text-[9px]">Pricing</p>
            <p className="text-accent-main font-black leading-tight">Varies by Work</p>
          </div>
          {(worker.address?.city || distance) && (
            <div className="col-span-2 flex items-center gap-1.5 text-text-muted border-t border-blue-100/60 pt-2 mt-1">
              <MapPin className="w-3.5 h-3.5 text-accent-main shrink-0" />
              <span className="truncate uppercase tracking-tight font-semibold">{worker.address?.city || `${distance} KM`}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
        <button
          onClick={() => navigate(`/workers/${_id}`)}
          className="flex-1 py-2.5 rounded-xl border border-gray-300 text-[10px] font-black text-text-primary hover:bg-gray-100 uppercase tracking-widest transition-all"
        >
          PROFILE
        </button>
        <button
          onClick={() => onBook && onBook(worker)}
          className="flex-1 py-2.5 rounded-xl bg-accent-main text-white text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
        >
          BOOK NOW
        </button>
      </div>
    </GlassCard>
  );
};

export default WorkerCard;

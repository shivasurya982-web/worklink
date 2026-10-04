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
    <GlassCard className="relative flex flex-col justify-between h-full bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all">

      {/* Top Section */}
      <div className="flex items-start justify-between mb-5">
        <div className="relative shrink-0">
          <img
            src={avatarUrl}
            alt={name}
            loading="lazy"
            onError={(e) => handleImageError(e, fallbackAvatar)}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-slate-200 shadow-xs group-hover:scale-105 transition-all duration-300"
          />
          {isAvailable && (
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-xs" />
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          {isVerified && <Badge variant="verified" size="xs">VERIFIED</Badge>}
          {onToggleFavorite && (
            <button
              onClick={(e) => { e.preventDefault(); onToggleFavorite(_id); }}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-red-300 hover:bg-red-50 transition-all text-slate-400 hover:text-red-500 shadow-xs cursor-pointer"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="flex-1 mb-5">
        <h4 className="font-sora font-bold text-base text-slate-900 line-clamp-1 leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
          {name}
        </h4>
        <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider mt-1">{profession}</p>

        <div className="mt-3">
          <RatingStars rating={rating} totalReviews={totalReviews} size="xs" />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-5 text-[10px] font-bold text-slate-700 bg-slate-50 rounded-xl p-3 border border-slate-100">
          <div className="space-y-0.5">
            <p className="text-slate-500 uppercase tracking-wider text-[9px]">Experience</p>
            <p className="text-slate-900 font-bold">{experience} Yrs</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-slate-500 uppercase tracking-wider text-[9px]">Pricing</p>
            <p className="text-indigo-600 font-bold leading-tight">Varies by Work</p>
          </div>
          {(worker.address?.city || distance) && (
            <div className="col-span-2 flex items-center gap-1.5 text-slate-500 border-t border-slate-200/60 pt-2 mt-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate uppercase tracking-tight font-medium">{worker.address?.city || `${distance} KM`}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-slate-100">
        <button
          onClick={() => navigate(`/workers/${_id}`)}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-[10px] font-bold text-slate-800 hover:bg-slate-50 uppercase tracking-wider transition-all shadow-xs cursor-pointer"
        >
          PROFILE
        </button>
        <button
          onClick={() => onBook && onBook(worker)}
          className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs transition-all cursor-pointer"
        >
          BOOK NOW
        </button>
      </div>
    </GlassCard>
  );
};

export default WorkerCard;

import React from 'react';
import { Quote } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import RatingStars from '../common/RatingStars';
import { getImageUrl, handleImageError, DEFAULT_AVATAR } from '../../utils/imageUtils';

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Homeowner, Delhi',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120',
    comment: 'Found a top-rated electrician within 2 minutes! He arrived in 20 minutes and fixed our main circuit breaker efficiently. The recommendation was spot on.',
    rating: 5,
  },
  {
    name: 'Amitabh Verma',
    role: 'Apartment Owner, Tiruchendur',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120',
    comment: 'Booked AC servicing through Worklyn. Being able to track the technician on Google Maps and chat directly made the experience completely hassle-free.',
    rating: 5,
  },
  {
    name: 'Ramesh Carpenter',
    role: 'Verified Worker, Bengaluru',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120',
    comment: 'Since joining Worklyn, my monthly earnings have doubled! The worker dashboard makes managing my schedule and booking requests effortless.',
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block mb-1">
            User Feedback
          </span>
          <h2 className="text-2xl sm:text-4xl font-sora font-bold text-slate-900 uppercase tracking-tight">
            What Customers & Workers Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <GlassCard key={t.name} className="flex flex-col justify-between relative bg-white border border-slate-200/80 shadow-xs">
              <Quote className="w-8 h-8 text-slate-200 absolute top-4 right-4" />
              <div>
                <RatingStars rating={t.rating} size="sm" />
                <p className="text-xs text-slate-600 leading-relaxed mt-3 mb-6 italic font-medium">
                  "{t.comment}"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <img
                  src={getImageUrl(t.avatar, DEFAULT_AVATAR(t.name))}
                  alt={t.name}
                  onError={(e) => handleImageError(e, DEFAULT_AVATAR(t.name))}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase">{t.name}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">{t.role}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

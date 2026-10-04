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
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-accent-main uppercase tracking-widest font-outfit">
            User Feedback
          </span>
          <h2 className="text-3xl font-sora font-black text-text-primary mt-1 uppercase">
            What Customers & Workers Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <GlassCard key={t.name} orangeBorder className="flex flex-col justify-between relative !bg-white/70 border border-white/75 shadow-sm">
              <Quote className="w-8 h-8 text-orange-200/80 absolute top-4 right-4" />
              <div>
                <RatingStars rating={t.rating} size="sm" />
                <p className="text-xs text-text-secondary leading-relaxed mt-4 mb-6 italic font-medium">
                  "{t.comment}"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <img
                  src={getImageUrl(t.avatar, DEFAULT_AVATAR(t.name))}
                  alt={t.name}
                  onError={(e) => handleImageError(e, DEFAULT_AVATAR(t.name))}
                  className="w-10 h-10 rounded-full object-cover border border-accent-main"
                />
                <div>
                  <h4 className="text-xs font-bold text-text-primary uppercase">{t.name}</h4>
                  <p className="text-[11px] text-text-muted">{t.role}</p>
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

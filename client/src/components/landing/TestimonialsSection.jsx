import React from 'react';
import { Star, Quote } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import RatingStars from '../common/RatingStars';

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
    role: 'Apartment Owner, Mumbai',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120',
    comment: 'Booked AC servicing through WorkLink. Being able to track the technician on Google Maps and chat directly made the experience completely hassle-free.',
    rating: 5,
  },
  {
    name: 'Ramesh Carpenter',
    role: 'Verified Worker, Bengaluru',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120',
    comment: 'Since joining WorkLink, my monthly earnings have doubled! The worker dashboard makes managing my schedule and booking requests effortless.',
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-background-secondary/40 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold text-accent-gold uppercase tracking-widest font-outfit">
            User Feedback
          </span>
          <h2 className="text-3xl font-sora font-bold text-text-primary mt-1">
            What Customers & Workers Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <GlassCard key={t.name} goldBorder className="flex flex-col justify-between relative">
              <Quote className="w-8 h-8 text-accent-gold/20 absolute top-4 right-4" />
              <div>
                <RatingStars rating={t.rating} size="sm" />
                <p className="text-xs text-text-secondary leading-relaxed mt-4 mb-6 italic">
                  "{t.comment}"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border border-accent-gold/40"
                />
                <div>
                  <h4 className="text-xs font-semibold text-text-primary">{t.name}</h4>
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

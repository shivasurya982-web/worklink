import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import WorkerCard from '../common/WorkerCard';
import API from '../../services/api';

const mockWorkers = [
  {
    _id: 'mock1',
    name: 'Rajesh Kumar',
    profession: 'Master Electrician',
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150',
    rating: 4.9,
    totalReviews: 48,
    experience: 8,
    pricing: { hourly: 350, currency: '₹' },
    isVerified: true,
    isAvailable: true,
    matchPercentage: 98,
    distance: 1.2,
  },
  {
    _id: 'mock2',
    name: 'Vikram Singh',
    profession: 'Licensed Plumber',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    rating: 4.8,
    totalReviews: 62,
    experience: 6,
    pricing: { hourly: 300, currency: '₹' },
    isVerified: true,
    isAvailable: true,
    matchPercentage: 95,
    distance: 2.5,
  },
  {
    _id: 'mock3',
    name: 'Amit Sharma',
    profession: 'AC Technician',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    rating: 4.9,
    totalReviews: 89,
    experience: 10,
    pricing: { hourly: 450, currency: '₹' },
    isVerified: true,
    isAvailable: true,
    matchPercentage: 99,
    distance: 0.8,
  },
  {
    _id: 'mock4',
    name: 'Suresh Patel',
    profession: 'Expert Carpenter',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    rating: 4.7,
    totalReviews: 35,
    experience: 7,
    pricing: { hourly: 400, currency: '₹' },
    isVerified: true,
    isAvailable: false,
    matchPercentage: 92,
    distance: 3.1,
  },
];

const FeaturedWorkers = () => {
  const [workers, setWorkers] = useState(mockWorkers);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopWorkers = async () => {
      try {
        const res = await API.get('/search/workers?limit=4&sortBy=rating');
        if (res.success && res.data?.length > 0) {
          setWorkers(res.data);
        }
      } catch (err) {
        // Fallback to mock data if backend not connected yet
      }
    };
    fetchTopWorkers();
  }, []);

  return (
    <section className="py-16 bg-background-secondary/50 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-blue/10 text-accent-blue text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" /> AI Recommended
            </div>
            <h2 className="text-3xl font-sora font-bold text-text-primary">
              Featured Local Professionals
            </h2>
          </div>
          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-gold hover:underline mt-4 md:mt-0"
          >
            Explore All Workers <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {workers.map((worker) => (
            <WorkerCard
              key={worker._id}
              worker={worker}
              onBook={(w) => navigate(`/workers/${w._id}`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedWorkers;

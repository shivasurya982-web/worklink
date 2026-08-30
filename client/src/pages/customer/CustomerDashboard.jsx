import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Calendar, Heart, Bell, MapPin, Search, ArrowRight, ShieldCheck, Trash2, User, Briefcase, Star, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import WorkerCard from '../../components/common/WorkerCard';
import PremiumButton from '../../components/common/PremiumButton';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import RatingStars from '../../components/common/RatingStars';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import BroadcastBookingModal from '../../components/common/BroadcastBookingModal';
import API from '../../services/api';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications, showToast } = useNotification();

  const [stats, setStats] = useState({ totalBookings: 0, favoritesCount: 0, unreadNotifications: 0 });
  const [recommendedWorkers, setRecommendedWorkers] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // Broadcast Modal State
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);

  // Live Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState({ categories: [], workers: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const timer = setTimeout(async () => {
        try {
          const res = await API.get(`/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
          if (res.success) {
            setSuggestions(res.data);
            setShowSuggestions(true);
          }
        } catch (err) {
          console.error('Suggestions error:', err);
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions({ categories: [], workers: [] });
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const fetchDashboard = async () => {
    try {
      const res = await API.get('/customers/dashboard');
      if (res.success) {
        setStats(res.data.stats || {});
        setRecommendedWorkers(res.data.recommendedWorkers || []);
      }

      // Fetch bookings to find completed but not reviewed ones
      const bookingsRes = await API.get('/bookings?status=completed');
      if (bookingsRes.success) {
        const list = Array.isArray(bookingsRes.data) ? bookingsRes.data : (bookingsRes.data?.bookings || []);
        const unreviewed = list.filter(b => !b.isReviewed);
        setPendingReviews(unreviewed);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleOpenReview = (booking) => {
    setSelectedBooking(booking);
    setRating(5);
    setComment('');
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    try {
      const res = await API.post('/reviews', {
        booking: selectedBooking._id,
        worker: selectedBooking.worker._id,
        rating,
        comment,
      });
      if (res.success) {
        showToast('Review Submitted', 'Thank you for your rating!', 'success');
        setReviewModalOpen(false);
        setPendingReviews(prev => prev.filter(p => p._id !== selectedBooking._id));
        fetchDashboard();
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <DashboardLayout
      title={`Welcome back, ${user?.name || 'Customer'}! 👋`}
      subtitle="Find Your Trusted Local Service Companion"
    >
      {/* Interactive Search Bar Banner */}
      <div className="relative mb-8 z-20">
        <GlassCard goldBorder className="bg-gradient-to-r from-amber-500/10 via-white to-accent-blue/10 p-4 sm:p-5 md:p-6 rounded-3xl border border-accent-gold/30 shadow-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/customer/search?q=${encodeURIComponent(searchQuery)}`);
              setShowSuggestions(false);
            }}
            className="flex flex-col sm:flex-row items-center gap-3 w-full"
          >
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 text-accent-gold absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                placeholder="Search electrician, plumber, carpenter, mechanic nearby..."
                className="w-full bg-white border border-gray-200 rounded-full pl-12 pr-4 py-3 text-xs sm:text-sm font-medium focus:outline-none focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20 shadow-inner"
                autoComplete="off"
              />
            </div>

            <PremiumButton type="submit" variant="gold" size="md" icon={Search} className="w-full sm:w-auto shrink-0 min-h-[46px] px-6">
              Search Nearby Workers
            </PremiumButton>

            <div className="hidden sm:block w-px h-10 bg-gray-200 mx-2" />

            <PremiumButton
              type="button"
              variant="ai"
              size="md"
              icon={Sparkles}
              className="w-full sm:w-auto shrink-0 min-h-[46px] px-6"
              onClick={() => setBroadcastModalOpen(true)}
            >
              Broadcast Request
            </PremiumButton>
          </form>
        </GlassCard>

        {/* Live Search Suggestions Dropdown */}
        {showSuggestions && (suggestions.categories.length > 0 || suggestions.workers.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in z-30 max-h-[400px] overflow-y-auto">
            {/* Categories Section */}
            {suggestions.categories.length > 0 && (
              <div className="p-2 border-b border-gray-50">
                <p className="text-[10px] font-bold text-accent-gold uppercase tracking-widest px-3 mb-2">Categories</p>
                {suggestions.categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => {
                      navigate(`/customer/search?category=${cat.slug}`);
                      setShowSuggestions(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-amber-50 flex items-center gap-3 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-white border border-amber-100/50">
                       <Sparkles className="w-4 h-4 text-accent-gold" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-primary">{cat.name}</p>
                      <p className="text-[9px] text-text-muted">Direct service matching</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Workers Section */}
            {suggestions.workers.length > 0 && (
              <div className="p-2">
                <p className="text-[10px] font-bold text-accent-blue uppercase tracking-widest px-3 mb-2">Professionals</p>
                {suggestions.workers.map((worker) => (
                  <button
                    key={worker._id}
                    onClick={() => {
                      navigate(`/workers/${worker._id}`);
                      setShowSuggestions(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-blue-50 flex items-center gap-3 transition-colors group"
                  >
                    <img
                      src={worker.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}&background=random`}
                      alt={worker.name}
                      className="w-8 h-8 rounded-full object-cover border border-blue-100"
                    />
                    <div>
                      <p className="text-xs font-bold text-text-primary">{worker.name}</p>
                      <p className="text-[9px] text-text-muted italic">{worker.profession}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* View all button */}
            <button
              onClick={() => {
                navigate(`/customer/search?q=${encodeURIComponent(searchQuery)}`);
                setShowSuggestions(false);
              }}
              className="w-full p-3 bg-gray-50 text-center text-[10px] font-bold text-text-secondary hover:text-accent-gold transition-colors flex items-center justify-center gap-2"
            >
              See all results for "{searchQuery}" <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Click outside to close overlay */}
        {showSuggestions && (
          <div
            className="fixed inset-0 z-20"
            onClick={() => setShowSuggestions(false)}
          />
        )}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
        <GlassCard className="flex items-center gap-4 p-4 md:p-5">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-amber-50 text-accent-gold flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-xl md:text-2xl font-sora font-bold text-text-primary truncate">
              {stats.totalBookings || 0}
            </div>
            <div className="text-[10px] md:text-xs text-text-muted font-bold uppercase tracking-wider">Total Bookings</div>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4 p-4 md:p-5">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-red-50 text-accent-red flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-xl md:text-2xl font-sora font-bold text-text-primary truncate">
              {stats.favoritesCount || 0}
            </div>
            <div className="text-[10px] md:text-xs text-text-muted font-bold uppercase tracking-wider">Saved Favorites</div>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4 p-4 md:p-5">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-blue-50 text-accent-blue flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-xl md:text-2xl font-sora font-bold text-text-primary truncate">
              {notifications.filter(n => !n.isRead).length || 0}
            </div>
            <div className="text-[10px] md:text-xs text-text-muted font-bold uppercase tracking-wider">Unread Alerts</div>
          </div>
        </GlassCard>
      </div>

      {/* Pending Reviews Section */}
      {pendingReviews.length > 0 && (
        <div className="mb-10 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-sora font-bold text-lg text-text-primary flex items-center gap-2">
              <Star className="w-5 h-5 text-accent-gold fill-accent-gold" /> Rate Your Recent Services
            </h3>
            <span className="text-[10px] bg-amber-100 text-accent-gold px-2 py-1 rounded-full font-bold uppercase tracking-wider">
              {pendingReviews.length} Pending
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingReviews.map((booking) => (
              <GlassCard key={booking._id} goldBorder className="p-4 bg-white border-2 border-accent-gold/20 shadow-md flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                   <div className="relative">
                      <img src={booking.worker?.avatar || 'https://via.placeholder.com/50'} className="w-12 h-12 rounded-full object-cover border border-accent-gold/30" />
                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full border-2 border-white p-0.5"><CheckCircle2 className="w-2.5 h-2.5 text-white" /></div>
                   </div>
                   <div>
                      <h4 className="text-sm font-bold text-text-primary">{booking.worker?.name}</h4>
                      <p className="text-[11px] text-text-muted">{booking.worker?.profession}</p>
                      <p className="text-[10px] text-text-secondary mt-0.5">Completed: {new Date(booking.updatedAt).toLocaleDateString()}</p>
                   </div>
                </div>
                <PremiumButton variant="gold" size="sm" onClick={() => handleOpenReview(booking)}>Rate Now</PremiumButton>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Workers Section - Now full width */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-sora font-bold text-lg text-text-primary flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-gold" /> Recommended Professionals For You
          </h3>
          <Link to="/customer/search" className="text-xs text-accent-gold font-bold hover:underline flex items-center gap-1 uppercase tracking-wider">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recommendedWorkers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {recommendedWorkers.map((worker) => (
              <WorkerCard
                key={worker._id}
                worker={worker}
                onBook={(w) => navigate(`/workers/${w._id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
             <Sparkles className="w-10 h-10 text-gray-200 mx-auto mb-3" />
             <p className="text-xs text-text-muted">No recommendations yet. Start searching for workers near your location!</p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModalOpen && (
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title={`Rate & Review ${selectedBooking?.worker?.name}`}
        >
          <form onSubmit={handleSubmitReview} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-text-primary block mb-2">
                Your Rating
              </label>
              <RatingStars
                rating={rating}
                interactive={true}
                onChange={(stars) => setRating(stars)}
                size="md"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-text-primary block mb-1">
                Review Comment
              </label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your review here. Tell us about your service experience..."
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-accent-gold"
                required
              />
            </div>

            <PremiumButton
              type="submit"
              variant="gold"
              size="lg"
              fullWidth
              loading={reviewLoading}
            >
              Submit Review
            </PremiumButton>
          </form>
        </Modal>
      )}

      {/* Broadcast Modal */}
      {broadcastModalOpen && (
        <BroadcastBookingModal
          onClose={() => setBroadcastModalOpen(false)}
          onBroadcast={(booking) => {
            showToast('Request Broadcasted!', 'Available workers in your area have been notified.', 'success');
            fetchDashboard();
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default CustomerDashboard;

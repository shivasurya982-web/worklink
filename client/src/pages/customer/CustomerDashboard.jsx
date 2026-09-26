import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Calendar, Heart, Bell, Search, ArrowRight, Star } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import WorkerCard from '../../components/common/WorkerCard';
import PremiumButton from '../../components/common/PremiumButton';
import Modal from '../../components/common/Modal';
import RatingStars from '../../components/common/RatingStars';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import BroadcastBookingModal from '../../components/common/BroadcastBookingModal';
import API from '../../services/api';
import { getImageUrl, handleImageError, DEFAULT_AVATAR } from '../../utils/imageUtils';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications, showToast } = useNotification();

  const [stats, setStats] = useState({ totalBookings: 0, favoritesCount: 0, unreadNotifications: 0 });
  const [recommendedWorkers, setRecommendedWorkers] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);

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
      const bookingsRes = await API.get('/bookings?status=completed');
      if (bookingsRes.success) {
        const list = Array.isArray(bookingsRes.data) ? bookingsRes.data : (bookingsRes.data?.bookings || []);
        setPendingReviews(list.filter(b => !b.isReviewed));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

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
        showToast('Review Saved', 'Thank you for your feedback.', 'success');
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
      title={`Hi, ${user?.name || 'User'}! 👋`}
      subtitle="Welcome back to your account"
    >
      <div className="relative mb-8 z-30">
        <GlassCard className="!bg-white/80 p-4 sm:p-6 rounded-[2rem] border border-white/60 shadow-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/customer/search?q=${encodeURIComponent(searchQuery)}`);
              setShowSuggestions(false);
            }}
            className="flex flex-col md:flex-row items-center gap-3"
          >
            <div className="relative flex-1 w-full group">
              <Search className="w-5 h-5 text-accent-main absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                placeholder="Search for services or workers..."
                className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-5 py-3.5 text-sm font-bold focus:outline-none focus:border-accent-main focus:ring-4 focus:ring-blue-500/10 shadow-xs text-text-primary placeholder:text-text-muted"
                autoComplete="off"
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
               <PremiumButton type="submit" variant="gold" size="md" icon={Search} className="flex-1 md:flex-none px-6 font-black">SEARCH</PremiumButton>
               <PremiumButton type="button" variant="ai" size="md" icon={Sparkles} className="flex-1 md:flex-none px-6 font-black" onClick={() => setBroadcastModalOpen(true)}>POST REQUEST</PremiumButton>
            </div>
          </form>
        </GlassCard>

        {showSuggestions && (suggestions.categories.length > 0 || suggestions.workers.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 rounded-2xl shadow-xl border border-white/60 overflow-hidden z-30 max-h-[400px] overflow-y-auto">
             {suggestions.categories.length > 0 && (
               <div className="p-2 border-b border-gray-100">
                 {suggestions.categories.map(cat => (
                   <button key={cat._id} onClick={() => navigate(`/customer/search?category=${cat.slug}`)} className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-blue-50/60 flex items-center gap-3 transition-all">
                      <Sparkles className="w-4 h-4 text-accent-main" />
                      <span className="text-xs font-bold text-text-primary uppercase tracking-tight">{cat.name}</span>
                   </button>
                 ))}
               </div>
             )}
             {suggestions.workers.length > 0 && (
               <div className="p-2">
                 {suggestions.workers.map(w => (
                   <button key={w._id} onClick={() => navigate(`/workers/${w._id}`)} className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-blue-50/60 flex items-center gap-3 transition-all">
                      <img src={getImageUrl(w.avatar, DEFAULT_AVATAR(w.name))} onError={(e) => handleImageError(e, DEFAULT_AVATAR(w.name))} className="w-9 h-9 rounded-full object-cover border border-accent-main" />
                      <div><p className="text-xs font-bold text-text-primary uppercase">{w.name}</p><p className="text-[10px] text-text-muted font-semibold">{w.profession}</p></div>
                   </button>
                 ))}
               </div>
             )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-10">
        {[
          { label: 'My Bookings', val: stats.totalBookings || 0, icon: Calendar, color: 'text-accent-main' },
          { label: 'Favorites', val: stats.favoritesCount || 0, icon: Heart, color: 'text-red-500' },
          { label: 'Alerts', val: notifications.filter(n => !n.isRead).length || 0, icon: Bell, color: 'text-accent-main' },
        ].map((s, i) => (
          <GlassCard key={i} className="flex items-center gap-4 p-5 !bg-white/70 border border-white/60 shadow-xs group">
             <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 group-hover:bg-accent-main transition-all duration-300">
               <s.icon className={`w-6 h-6 ${s.color} group-hover:text-white transition-colors`} />
             </div>
             <div>
                <p className="text-2xl font-sora font-black text-text-primary tracking-tight">{s.val}</p>
                <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mt-0.5">{s.label}</p>
             </div>
          </GlassCard>
        ))}
      </div>

      {pendingReviews.length > 0 && (
        <div className="mb-10">
          <h3 className="text-lg font-sora font-black text-text-primary mb-4 uppercase tracking-tight flex items-center gap-2.5"><Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Pending Reviews</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingReviews.map(b => (
              <GlassCard key={b._id} className="p-4 flex items-center justify-between gap-3 border border-white/60 !bg-white/80 shadow-xs">
                 <div className="flex items-center gap-3 min-w-0">
                    <img src={getImageUrl(b.worker?.avatar, DEFAULT_AVATAR(b.worker?.name || 'P'))} onError={(e) => handleImageError(e, DEFAULT_AVATAR(b.worker?.name || 'P'))} className="w-12 h-12 rounded-2xl object-cover border border-accent-main" />
                    <div className="min-w-0"><h4 className="text-xs font-black text-text-primary truncate">{b.worker?.name}</h4><p className="text-[10px] text-accent-main font-bold uppercase tracking-wider mt-0.5">{b.worker?.profession}</p></div>
                 </div>
                 <PremiumButton variant="gold" size="sm" onClick={() => handleOpenReview(b)} className="font-black px-5">REVIEW</PremiumButton>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      <div className="mb-10">
        <div className="flex items-center justify-between mb-6 px-1">
          <h3 className="text-lg font-sora font-black text-text-primary uppercase tracking-tight flex items-center gap-2.5"><Sparkles className="w-5 h-5 text-accent-main" /> Recommended for You</h3>
          <Link to="/customer/search" className="text-[9px] font-bold text-accent-main uppercase tracking-wider hover:underline">See All <ArrowRight className="w-3.5 h-3.5 inline-block ml-0.5" /></Link>
        </div>
        {recommendedWorkers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recommendedWorkers.map(w => <WorkerCard key={w._id} worker={w} onBook={worker => navigate(`/workers/${worker._id}?book=true`)} />)}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/60 rounded-[2.5rem] border-2 border-dashed border-gray-200"><p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Loading recommendations...</p></div>
        )}
      </div>

      <BroadcastBookingModal isOpen={broadcastModalOpen} onClose={() => setBroadcastModalOpen(false)} onBroadcast={() => { showToast('Request Sent', 'Your request has been posted.', 'success'); fetchDashboard(); }} />

      {reviewModalOpen && (
        <Modal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} title="Give Feedback">
          <form onSubmit={handleSubmitReview} className="space-y-6 pt-2">
             <div className="flex flex-col items-center gap-4"><p className="text-[10px] font-bold uppercase tracking-widest text-accent-main">Rate your experience</p><RatingStars rating={rating} interactive={true} onChange={setRating} size="lg" /></div>
             <textarea rows={4} value={comment} onChange={e => setComment(e.target.value)} placeholder="Tell us what you liked or how they can improve..." className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-xs font-bold text-text-primary focus:outline-none focus:border-accent-main shadow-xs" required />
             <PremiumButton type="submit" variant="gold" size="lg" fullWidth loading={reviewLoading} className="py-4 font-black">SUBMIT REVIEW</PremiumButton>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default CustomerDashboard;

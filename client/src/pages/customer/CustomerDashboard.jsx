import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Calendar, Heart, Bell, Search, ArrowRight, CheckCircle2, Star } from 'lucide-react';
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
        <GlassCard className="!bg-background-dark/80 p-4 sm:p-6 rounded-[2rem] border border-accent-main/30 shadow-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/customer/search?q=${encodeURIComponent(searchQuery)}`);
              setShowSuggestions(false);
            }}
            className="flex flex-col md:flex-row items-center gap-4"
          >
            <div className="relative flex-1 w-full group">
              <Search className="w-5 h-5 text-accent-bright absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                placeholder="Search for services or workers..."
                className="w-full bg-background-cardSecondary border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold focus:outline-none focus:border-accent-main focus:ring-4 focus:ring-accent-main/10 shadow-2xl text-white placeholder:text-text-muted"
                autoComplete="off"
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
               <PremiumButton type="submit" variant="gold" size="md" icon={Search} className="flex-1 md:flex-none px-8 font-black">SEARCH</PremiumButton>
               <PremiumButton type="button" variant="ai" size="md" icon={Sparkles} className="flex-1 md:flex-none px-8 font-black" onClick={() => setBroadcastModalOpen(true)}>POST REQUEST</PremiumButton>
            </div>
          </form>
        </GlassCard>

        {showSuggestions && (suggestions.categories.length > 0 || suggestions.workers.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-3 bg-background-cardSecondary rounded-3xl shadow-[0_40px_80px_rgba(0,0,0,0.8)] border border-border-primary/40 overflow-hidden animate-fade-in z-30 max-h-[400px] overflow-y-auto">
             {suggestions.categories.length > 0 && (
               <div className="p-3 border-b border-white/5">
                 {suggestions.categories.map(cat => (
                   <button key={cat._id} onClick={() => navigate(`/customer/search?category=${cat.slug}`)} className="w-full text-left px-5 py-3 rounded-2xl hover:bg-white/5 flex items-center gap-4 transition-all">
                      <Sparkles className="w-4 h-4 text-accent-bright" />
                      <span className="text-sm font-bold text-white uppercase tracking-tight">{cat.name}</span>
                   </button>
                 ))}
               </div>
             )}
             {suggestions.workers.length > 0 && (
               <div className="p-3">
                 {suggestions.workers.map(w => (
                   <button key={w._id} onClick={() => navigate(`/workers/${w._id}`)} className="w-full text-left px-5 py-3 rounded-2xl hover:bg-white/5 flex items-center gap-4 transition-all">
                      <img src={getImageUrl(w.avatar, DEFAULT_AVATAR(w.name))} onError={(e) => handleImageError(e, DEFAULT_AVATAR(w.name))} className="w-10 h-10 rounded-full object-cover border-2 border-accent-main" />
                      <div><p className="text-sm font-bold text-white uppercase">{w.name}</p><p className="text-[10px] text-text-muted font-bold">{w.profession}</p></div>
                   </button>
                 ))}
               </div>
             )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12">
        {[
          { label: 'My Bookings', val: stats.totalBookings || 0, icon: Calendar, color: 'text-accent-bright' },
          { label: 'Favorites', val: stats.favoritesCount || 0, icon: Heart, color: 'text-red-500' },
          { label: 'Alerts', val: notifications.filter(n => !n.isRead).length || 0, icon: Bell, color: 'text-accent-bright' },
        ].map((s, i) => (
          <GlassCard key={i} className="flex items-center gap-5 p-5 sm:p-6 !bg-background-card border-border-primary/20 shadow-2xl group">
             <div className="w-14 h-14 rounded-2xl bg-background-widget flex items-center justify-center border border-white/5 group-hover:bg-accent-orange transition-all duration-500">
               <s.icon className={`w-7 h-7 ${s.color} group-hover:text-white transition-colors`} />
             </div>
             <div>
                <p className="text-2xl sm:text-3xl font-sora font-black text-white tracking-tighter">{s.val}</p>
                <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mt-1">{s.label}</p>
             </div>
          </GlassCard>
        ))}
      </div>

      {pendingReviews.length > 0 && (
        <div className="mb-12">
          <h3 className="text-xl font-sora font-black text-white mb-6 uppercase tracking-tight flex items-center gap-3"><Star className="w-6 h-6 text-accent-bright fill-accent-bright" /> Pending Reviews</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pendingReviews.map(b => (
              <GlassCard key={b._id} className="p-5 flex items-center justify-between gap-4 border border-border-primary/40 !bg-background-cardSecondary shadow-2xl">
                 <div className="flex items-center gap-4 min-w-0">
                    <img src={getImageUrl(b.worker?.avatar, DEFAULT_AVATAR(b.worker?.name || 'P'))} onError={(e) => handleImageError(e, DEFAULT_AVATAR(b.worker?.name || 'P'))} className="w-14 h-14 rounded-2xl object-cover border-2 border-accent-main" />
                    <div className="min-w-0"><h4 className="text-sm font-black text-white truncate">{b.worker?.name}</h4><p className="text-[10px] text-accent-light font-bold uppercase tracking-widest mt-0.5">{b.worker?.profession}</p></div>
                 </div>
                 <PremiumButton variant="gold" size="sm" onClick={() => handleOpenReview(b)} className="font-black px-6">REVIEW</PremiumButton>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      <div className="mb-12">
        <div className="flex items-center justify-between mb-8 px-2">
          <h3 className="text-xl font-sora font-black text-white uppercase tracking-tight flex items-center gap-3"><Sparkles className="w-6 h-6 text-accent-bright" /> Recommended for You</h3>
          <Link to="/customer/search" className="text-[9px] font-black text-accent-bright uppercase tracking-[0.3em] hover:text-white transition-colors">See All <ArrowRight className="w-4 h-4 inline-block ml-1" /></Link>
        </div>
        {recommendedWorkers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {recommendedWorkers.map(w => <WorkerCard key={w._id} worker={w} onBook={worker => navigate(`/workers/${worker._id}?book=true`)} />)}
          </div>
        ) : (
          <div className="text-center py-24 bg-background-cardSecondary/40 rounded-[3rem] border-2 border-dashed border-border-primary/20 opacity-50"><p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">Loading recommendations...</p></div>
        )}
      </div>

      <BroadcastBookingModal isOpen={broadcastModalOpen} onClose={() => setBroadcastModalOpen(false)} onBroadcast={() => { showToast('Request Sent', 'Your request has been posted.', 'success'); fetchDashboard(); }} />

      {reviewModalOpen && (
        <Modal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} title="Give Feedback">
          <form onSubmit={handleSubmitReview} className="space-y-8 pt-4">
             <div className="flex flex-col items-center gap-6"><p className="text-[10px] font-black uppercase tracking-widest text-accent-light">Rate your experience</p><RatingStars rating={rating} interactive={true} onChange={setRating} size="lg" /></div>
             <textarea rows={5} value={comment} onChange={e => setComment(e.target.value)} placeholder="Tell us what you liked or how they can improve..." className="w-full bg-background-dark/50 border-2 border-white/5 rounded-3xl p-6 text-sm font-bold text-white focus:outline-none focus:border-accent-main shadow-2xl" required />
             <PremiumButton type="submit" variant="gold" size="lg" fullWidth loading={reviewLoading} className="py-5 font-black shadow-orange">SUBMIT REVIEW</PremiumButton>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default CustomerDashboard;

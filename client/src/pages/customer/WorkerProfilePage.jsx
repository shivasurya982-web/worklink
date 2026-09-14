import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  CheckCircle2,
  Star,
  MapPin,
  Phone,
  MessageSquare,
  Heart,
  Clock,
  ShieldCheck,
  Calendar,
  Share2,
  Sparkles,
  Circle,
  ChevronDown,
  ChevronUp,
  Briefcase,
  LayoutGrid,
  Maximize2
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import GlassCard from '../../components/common/GlassCard';
import PremiumButton from '../../components/common/PremiumButton';
import { getImageUrl, handleImageError, DEFAULT_AVATAR, DEFAULT_COVER } from '../../utils/imageUtils';
import Badge from '../../components/common/Badge';
import RatingStars from '../../components/common/RatingStars';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import API from '../../services/api';

/* ── Review Item Component ── */
const ReviewItem = ({ review }) => {
  const [showComment, setShowComment] = useState(false);

  return (
    <div className="p-5 sm:p-6 rounded-[2rem] bg-background-dark/50 border border-white/5 space-y-4 shadow-inner">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={getImageUrl(review.customer?.avatar, DEFAULT_AVATAR(review.customer?.name || 'Customer'))}
            alt={review.customer?.name}
            onError={(e) => handleImageError(e, DEFAULT_AVATAR(review.customer?.name || 'Customer'))}
            className="w-10 h-10 rounded-xl object-cover border-2 border-accent-main shadow-xl"
          />
          <div className="min-w-0">
            <span className="text-xs font-black text-white uppercase tracking-tight truncate block">
              {review.customer?.name || 'Customer'}
            </span>
            <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mt-0.5">Verified Customer</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <RatingStars rating={review.rating} size="xs" />
          <button
            onClick={() => setShowComment(!showComment)}
            className="text-[9px] font-black text-accent-bright hover:text-white transition-colors uppercase tracking-[0.2em]"
          >
            {showComment ? 'Hide Review' : 'Read Review'}
          </button>
        </div>
      </div>

      {showComment && (
        <div className="animate-fade-in pt-2">
          <p className="text-xs text-text-secondary leading-relaxed font-bold italic opacity-90">
            "{review.comment}"
          </p>
          {review.workerReply && (
            <div className="p-4 bg-accent-orange/10 rounded-2xl text-xs text-accent-peach mt-4 border border-accent-orange/30 ml-6">
              <span className="font-black text-accent-bright block mb-2 uppercase tracking-widest">Worker's Reply:</span>
              <p className="font-medium">"{review.workerReply}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const WorkerProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, role, user } = useAuth();
  const { showToast } = useNotification();

  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [pendingBookingForReview, setPendingBooking] = useState(null);

  // Auto-open booking modal if query param exists
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('book') === 'true') {
      setBookingModalOpen(true);
    }
  }, [location.search]);

  // Booking State
  const [bookingType, setBookingType] = useState('small'); // 'small' or 'large'
  const [bookingDate, setBookingDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookingTime, setBookingTime] = useState('10:00');
  const [workingHours, setWorkingHours] = useState('full-day'); // 'full-day' or custom
  const [customHours, setCustomHours] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [serviceAddress, setServiceAddress] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zip: user?.address?.zip || '',
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  // Review State
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    fetchWorkerData();
    if (isAuthenticated && role === 'customer') {
      fetchFavoriteStatus();
      checkPendingReview();
    }
  }, [id, isAuthenticated, role]);

  const checkPendingReview = async () => {
    try {
      const res = await API.get('/bookings?status=completed');
      if (res.success) {
        const list = Array.isArray(res.data) ? res.data : (res.data?.bookings || []);
        const pending = list.find(b => String(b.worker?._id || b.worker) === String(id) && !b.isReviewed);
        setPendingBooking(pending || null);
      }
    } catch (err) {}
  };

  const fetchWorkerData = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/workers/${id}/public`);
      if (res.success && res.data.worker) {
        setWorker(res.data.worker);
        setReviews(res.data.reviews || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavoriteStatus = async () => {
    try {
      const res = await API.get('/customers/favorites');
      if (res.success && res.data) {
        const favWorkerIds = (res.data || []).map((f) => (f.worker?._id || f.worker || f._id || f).toString());
        setIsFavorite(favWorkerIds.includes(String(id)));
      }
    } catch {
      // silent
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated || role !== 'customer') {
      showToast('Login Required', 'Please login to save workers to your favorites.', 'info');
      navigate('/login');
      return;
    }
    try {
      if (isFavorite) {
        await API.delete(`/customers/favorites/${id}`);
        setIsFavorite(false);
        showToast('Removed', 'Worker removed from favorites.', 'info');
      } else {
        await API.post(`/customers/favorites/${id}`);
        setIsFavorite(true);
        showToast('Saved', 'Worker added to favorites! ❤️', 'success');
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Login Required', 'Please login to book a service.', 'info');
      navigate('/login');
      return;
    }

    if (bookingType === 'large' && !endDate) {
      showToast('Date Required', 'Please select an end date for large works.', 'error');
      return;
    }

    setBookingLoading(true);
    try {
      const payload = {
        worker: worker._id,
        bookingType,
        scheduledDate: bookingDate,
        description: workDescription,
        address: serviceAddress,
        estimatedCost: worker.pricing?.hourly || 350,
      };

      if (bookingType === 'small') {
        payload.scheduledTime = bookingTime;
      } else {
        payload.endDate = endDate;
        payload.scheduledTime = '00:00'; // Default for large
        payload.workingHours = workingHours === 'full-day' ? 'Full Day (8am - 8pm)' : customHours;
      }

      const res = await API.post('/bookings', payload);

      if (res.success) {
        showToast('Booking Successful!', 'The worker has been notified.', 'success');
        setBookingModalOpen(false);
        navigate('/customer/bookings');
      }
    } catch (err) {
      showToast('Booking Error', err.message, 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !pendingBookingForReview) return;

    setReviewLoading(true);
    try {
      const res = await API.post('/reviews', {
        worker: worker._id,
        booking: pendingBookingForReview._id,
        rating: newRating,
        comment: newComment,
      });

      if (res.success) {
        showToast('Review Submitted', 'Thank you for your feedback.', 'success');
        setReviewModalOpen(false);
        setNewComment('');
        setPendingBooking(null);
        fetchWorkerData();
      }
    } catch (err) {
      showToast('Review Error', err.message, 'error');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleStartChat = () => {
    if (!isAuthenticated) {
      showToast('Login Required', 'Please login to start a chat.', 'info');
      navigate('/login');
      return;
    }
    navigate(`/customer/messages?worker=${worker._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-primary flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent-bright border-t-transparent shadow-orange" />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen bg-background-primary flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-32 text-center">
          <div className="w-24 h-24 bg-background-dark rounded-[2rem] flex items-center justify-center mb-8 border border-white/5 shadow-2xl">
            <Sparkles className="w-12 h-12 text-accent-bright opacity-20" />
          </div>
          <h2 className="text-3xl font-sora font-black text-white uppercase tracking-tighter">Worker Not Found</h2>
          <p className="text-xs font-black text-text-muted mt-2 mb-10 uppercase tracking-widest opacity-80">We could not find the worker profile you are looking for.</p>
          <PremiumButton variant="gold" size="lg" onClick={() => navigate('/search')}>GO BACK TO SEARCH</PremiumButton>
        </div>
        </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-background-primary flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-[600px] bg-accent-orange/10 blur-[150px] pointer-events-none" />

      <Navbar />

      <main className="pt-28 sm:pt-36 pb-24 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 relative z-10">
        {/* Profile Header */}
        <div className="relative rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden mb-12 shadow-[0_30px_100px_rgba(0,0,0,0.7)] border-4 border-white/5 group">
          <img
            src={getImageUrl(worker.coverImage, DEFAULT_COVER)}
            alt="Cover"
            onError={(e) => handleImageError(e, DEFAULT_COVER)}
            className="w-full h-64 md:h-96 object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/30 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8 text-white">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
              <div className="relative shrink-0">
                <img
                  src={getImageUrl(worker.avatar, DEFAULT_AVATAR(worker.name))}
                  alt={worker.name}
                  onError={(e) => handleImageError(e, DEFAULT_AVATAR(worker.name))}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] object-cover border-4 border-accent-main shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                />
                {worker.isAvailable && <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent-green rounded-2xl border-4 border-background-dark shadow-2xl animate-pulse" />}
              </div>
              <div className="min-w-0">
                <div className="flex flex-col sm:flex-row items-center gap-4 flex-wrap">
                  <h1 className="text-2xl md:text-5xl font-sora font-black text-white tracking-tighter uppercase truncate">{worker.name}</h1>
                  {worker.isVerified && (
                    <Badge variant="verified" size="sm" className="px-4 py-1.5 !rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-accent-bright" /> VERIFIED
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
                   <div className="bg-background-dark/50 backdrop-blur-xl px-4 py-1.5 rounded-xl border border-white/10">
                      <span className="text-[10px] font-black text-accent-bright uppercase tracking-widest">{worker.profession}</span>
                   </div>
                   {worker.category && (
                     <div className="bg-background-dark/50 backdrop-blur-xl px-4 py-1.5 rounded-xl border border-white/10">
                        <span className="text-[10px] font-black text-accent-light uppercase tracking-widest">{worker.category.name}</span>
                     </div>
                   )}
                </div>
                <p className="text-xs font-black text-white mt-4 flex items-center justify-center sm:justify-start gap-2 uppercase tracking-[0.2em] opacity-90">
                  <MapPin className="w-4 h-4 text-accent-bright" /> {worker.address?.city || 'City'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-end">
              <button
                onClick={handleStartChat}
                className="px-6 py-3.5 rounded-2xl bg-background-widget/80 hover:bg-accent-orange text-white text-[11px] font-black flex items-center gap-2.5 shadow-2xl backdrop-blur-md transition-all uppercase tracking-widest border border-white/10"
              >
                <MessageSquare className="w-5 h-5" /> CHAT FOR PRICING
              </button>

              <button
                onClick={handleToggleFavorite}
                className={`px-6 py-3.5 rounded-2xl text-[11px] font-black flex items-center gap-2.5 shadow-2xl backdrop-blur-md transition-all uppercase tracking-widest border ${
                  isFavorite
                    ? 'bg-red-950/40 text-red-400 border-red-500/30'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-400' : ''}`} />
                {isFavorite ? 'SAVED' : 'SAVE'}
              </button>

              <PremiumButton
                variant="gold"
                size="lg"
                onClick={() => setBookingModalOpen(true)}
                disabled={!worker.isAvailable}
                className="px-10 shadow-orange w-full sm:w-auto"
              >
                {worker.isAvailable ? 'BOOK NOW' : 'NOT AVAILABLE'}
              </PremiumButton>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8 sm:space-y-12">
            {/* About */}
            <GlassCard goldBorder className="p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[3rem] !bg-background-card border-border-primary/40 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-accent-orange/5 blur-3xl pointer-events-none" />
              <h3 className="font-sora font-black text-2xl text-white mb-6 uppercase tracking-tighter flex items-center gap-4">
                 <div className="w-1.5 h-8 bg-accent-bright rounded-full" /> BIO
              </h3>
              <p className="text-sm sm:text-lg text-text-secondary leading-relaxed font-bold italic opacity-90">
                 "{worker.description || 'Professional local service provider with years of experience.'}"
              </p>
            </GlassCard>

            {/* Portfolio */}
            {worker.portfolio?.length > 0 && (
              <GlassCard className="p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[3rem] !bg-background-card border-border-primary/40 shadow-2xl">
                <h3 className="font-sora font-black text-2xl text-white mb-10 uppercase tracking-tighter flex items-center gap-4">
                   <div className="w-1.5 h-8 bg-accent-main rounded-full" /> WORK PHOTOS
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {worker.portfolio.map((item, idx) => (
                    <div key={idx} className="flex flex-col rounded-[2.5rem] overflow-hidden border-2 border-white/5 bg-background-dark/40 hover:bg-background-dark/60 transition-all duration-500 group shadow-2xl">
                      <div className="h-56 overflow-hidden bg-background-widget relative">
                        <img
                          src={getImageUrl(item.url || item, DEFAULT_COVER)}
                          alt={item.title || `Work Photo ${idx}`}
                          onError={(e) => handleImageError(e, DEFAULT_COVER)}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-accent-orange/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="p-6">
                        <h4 className="font-sora font-black text-sm text-white mb-2 uppercase tracking-tight">
                          {item.title || `Job Completion #${idx + 1}`}
                        </h4>
                        <p className="text-[11px] text-text-muted font-bold italic leading-relaxed line-clamp-2">
                          {item.description ? `"${item.description}"` : 'Photo of a successfully completed job.'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Reviews */}
            <GlassCard className="p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[3rem] !bg-background-card border-border-primary/40 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-6">
                <div>
                  <h3 className="font-sora font-black text-2xl text-white uppercase tracking-tighter flex items-center gap-4">
                     <div className="w-1.5 h-8 bg-accent-gold rounded-full" /> REVIEWS
                  </h3>
                  <div className="flex items-center gap-3 mt-3">
                    <RatingStars rating={worker.rating || 0} size="sm" />
                    <span className="text-xs font-black text-accent-bright uppercase tracking-widest">({worker.rating || 0} Rating)</span>
                  </div>
                </div>

                {pendingBookingForReview && (
                  <PremiumButton variant="outline" size="sm" icon={Star} onClick={() => setReviewModalOpen(true)} className="px-6 font-black uppercase tracking-widest">
                    WRITE REVIEW
                  </PremiumButton>
                )}
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((r) => (
                    <ReviewItem key={r._id} review={r} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-background-dark/30 rounded-[2.5rem] border-2 border-dashed border-white/5 opacity-40">
                   <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">NO REVIEWS YET.</p>
                </div>
              )}
            </GlassCard>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <GlassCard goldBorder className="p-8 sm:p-10 rounded-[2.5rem] space-y-6 !bg-background-card border-border-primary/40 shadow-2xl">
              <h3 className="font-sora font-black text-lg text-white border-b border-white/5 pb-5 uppercase tracking-widest">
                DETAILS
              </h3>

              <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-background-dark/40 rounded-2xl border border-white/5">
                   <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">STATUS</span>
                   <Badge variant="verified" size="xs" className="!bg-accent-orange/20 text-accent-bright font-black">ACTIVE</Badge>
                 </div>

                 <div className="flex flex-col p-4 bg-background-dark/40 rounded-2xl border border-white/5 space-y-2">
                   <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">PRICING</span>
                   <p className="text-sm font-black text-white uppercase tracking-tight">Price varies by work</p>
                   <p className="text-[9px] text-accent-bright font-black uppercase tracking-widest">Contact worker for a quote</p>
                 </div>

                 <div className="flex items-center justify-between p-4 bg-background-dark/40 rounded-2xl border border-white/5">
                   <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">EXPERIENCE</span>
                   <span className="font-black text-white uppercase text-xs">{worker.experience || 0} YEARS</span>
                 </div>

                 <div className="flex items-center justify-between p-4 bg-background-dark/40 rounded-2xl border border-white/5">
                   <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">JOBS COMPLETED</span>
                   <span className="font-black text-white uppercase text-xs">{worker.completedJobs || 0} DONE</span>
                 </div>
              </div>

              <div className="pt-6 space-y-4">
                <button
                  onClick={handleStartChat}
                  className="w-full py-4 rounded-2xl bg-background-widget text-accent-bright border-2 border-border-primary/30 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-background-secondary transition-all"
                >
                  <MessageSquare className="w-5 h-5 inline-block mr-2" /> CHAT FOR PRICING
                </button>

                <PremiumButton
                  variant="gold"
                  size="lg"
                  fullWidth
                  onClick={() => setBookingModalOpen(true)}
                  disabled={!worker.isAvailable}
                  className="shadow-orange py-5"
                >
                  {worker.isAvailable ? 'BOOK SERVICE' : 'BUSY'}
                </PremiumButton>
              </div>
            </GlassCard>

          </div>
        </div>
      </main>


      {/* Booking Modal */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title={`Book Service: ${worker.name}`}
      >
        <form onSubmit={handleCreateBooking} className="space-y-6 pt-4">

          {/* Booking Type Toggle */}
          <div className="flex bg-background-dark/50 p-1.5 rounded-2xl border border-white/5 mb-6">
             <button
               type="button"
               onClick={() => setBookingType('small')}
               className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 bookingType === 'small' ? 'bg-accent-orange text-white shadow-xl' : 'text-text-muted hover:text-text-secondary'
               }`}
             >
               <LayoutGrid className="w-4 h-4" /> Small Work
             </button>
             <button
               type="button"
               onClick={() => setBookingType('large')}
               className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 bookingType === 'large' ? 'bg-accent-orange text-white shadow-xl' : 'text-text-muted hover:text-text-secondary'
               }`}
             >
               <Maximize2 className="w-4 h-4" /> Large Work
             </button>
          </div>

          <div className="bg-background-dark/50 p-6 sm:p-8 rounded-[2.5rem] border border-white/5 shadow-inner space-y-6">

            {/* Small Work View */}
            {bookingType === 'small' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-accent-bright uppercase tracking-widest ml-1">WORK DATE</label>
                    <div className="relative group cursor-pointer" onClick={(e) => {
                      const input = e.currentTarget.querySelector('input');
                      if (input) input.showPicker();
                    }}>
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-accent-bright group-focus-within:text-white transition-colors z-10 pointer-events-none" />
                      <input
                        type="date"
                        min={today}
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full bg-background-card border-2 border-border-primary/40 rounded-2xl p-4 pl-12 text-xs font-black text-white focus:outline-none focus:border-accent-main shadow-2xl relative"
                        required
                      />
                    </div>
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-accent-bright uppercase tracking-widest ml-1">START TIME</label>
                    <div className="relative group cursor-pointer" onClick={(e) => {
                      const input = e.currentTarget.querySelector('input');
                      if (input) input.showPicker();
                    }}>
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-accent-bright group-focus-within:text-white transition-colors z-10 pointer-events-none" />
                      <input
                        type="time"
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="w-full bg-background-card border-2 border-border-primary/40 rounded-2xl p-4 pl-12 text-xs font-black text-white focus:outline-none focus:border-accent-main shadow-2xl relative"
                        required
                      />
                    </div>
                </div>
              </div>
            ) : (
              /* Large Work View */
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                      <label className="text-[10px] font-black text-accent-bright uppercase tracking-widest ml-1">START DATE</label>
                      <div className="relative group cursor-pointer" onClick={(e) => {
                        const input = e.currentTarget.querySelector('input');
                        if (input) input.showPicker();
                      }}>
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-accent-bright group-focus-within:text-white transition-colors z-10 pointer-events-none" />
                        <input
                          type="date"
                          min={today}
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="w-full bg-background-card border-2 border-border-primary/40 rounded-2xl p-4 pl-12 text-xs font-black text-white focus:outline-none focus:border-accent-main shadow-2xl relative"
                          required
                        />
                      </div>
                  </div>
                  <div className="space-y-3">
                      <label className="text-[10px] font-black text-accent-bright uppercase tracking-widest ml-1">END DATE</label>
                      <div className="relative group cursor-pointer" onClick={(e) => {
                        const input = e.currentTarget.querySelector('input');
                        if (input) input.showPicker();
                      }}>
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-accent-bright group-focus-within:text-white transition-colors z-10 pointer-events-none" />
                        <input
                          type="date"
                          min={bookingDate || today}
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full bg-background-card border-2 border-border-primary/40 rounded-2xl p-4 pl-12 text-xs font-black text-white focus:outline-none focus:border-accent-main shadow-2xl relative"
                          required
                        />
                      </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-accent-bright uppercase tracking-widest ml-1">DAILY AVAILABILITY</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setWorkingHours('full-day')}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        workingHours === 'full-day' ? 'bg-accent-orange/20 border-accent-orange text-white' : 'bg-background-card border-white/5 text-text-muted'
                      }`}
                    >
                      Full Day
                    </button>
                    <button
                      type="button"
                      onClick={() => setWorkingHours('custom')}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        workingHours === 'custom' ? 'bg-accent-orange/20 border-accent-orange text-white' : 'bg-background-card border-white/5 text-text-muted'
                      }`}
                    >
                      Custom Time
                    </button>
                  </div>
                  {workingHours === 'custom' && (
                    <input
                      type="text"
                      placeholder="e.g. 9 AM - 1 PM"
                      value={customHours}
                      onChange={(e) => setCustomHours(e.target.value)}
                      className="w-full bg-background-card border-2 border-border-primary/40 rounded-2xl p-4 text-xs font-black text-white focus:outline-none focus:border-accent-main shadow-2xl mt-2 uppercase tracking-widest"
                      required={workingHours === 'custom'}
                    />
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[10px] font-black text-accent-bright uppercase tracking-widest ml-1">JOB DESCRIPTION</label>
              <textarea
                rows={3}
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                placeholder="Explain the work details here..."
                className="w-full bg-background-card border-2 border-border-primary/40 rounded-[2rem] p-5 text-sm font-bold focus:outline-none focus:border-accent-main text-white shadow-2xl"
                required
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <label className="text-[10px] font-black text-white uppercase tracking-[0.3em] block ml-1">ADDRESS</label>
              <div className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  placeholder="Street and Area"
                  value={serviceAddress.street}
                  onChange={(e) => setServiceAddress({...serviceAddress, street: e.target.value})}
                  className="w-full bg-background-card border-2 border-border-primary/40 rounded-2xl p-4 text-xs font-black text-white focus:outline-none focus:border-accent-main shadow-2xl"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    value={serviceAddress.city}
                    onChange={(e) => setServiceAddress({...serviceAddress, city: e.target.value})}
                    className="w-full bg-background-card border-2 border-border-primary/40 rounded-2xl p-4 text-xs font-black text-white focus:outline-none focus:border-accent-main shadow-2xl"
                    required
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={serviceAddress.state}
                    onChange={(e) => setServiceAddress({...serviceAddress, state: e.target.value})}
                    className="w-full bg-background-card border-2 border-border-primary/40 rounded-2xl p-4 text-xs font-black text-white focus:outline-none focus:border-accent-main shadow-2xl"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Pin Code"
                    value={serviceAddress.zip}
                    onChange={(e) => setServiceAddress({...serviceAddress, zip: e.target.value})}
                    className="w-full bg-background-card border-2 border-border-primary/40 rounded-2xl p-4 text-xs font-black text-white focus:outline-none focus:border-accent-main shadow-2xl"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <PremiumButton type="submit" variant="gold" size="lg" fullWidth loading={bookingLoading} className="py-5 text-base font-black shadow-orange uppercase tracking-[0.2em]">
            Confirm {bookingType === 'large' ? 'Project' : 'Booking'}
          </PremiumButton>
        </form>
      </Modal>
    </div>
  );
};

export default WorkerProfilePage;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  CheckCircle2,
  Star,
  MapPin,
  MessageSquare,
  Heart,
  Clock,
  Calendar,
  Sparkles,
  LayoutGrid,
  Maximize2
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
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
    <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/50 border border-blue-100/60 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={getImageUrl(review.customer?.avatar, DEFAULT_AVATAR(review.customer?.name || 'Customer'))}
            alt={review.customer?.name}
            onError={(e) => handleImageError(e, DEFAULT_AVATAR(review.customer?.name || 'Customer'))}
            className="w-10 h-10 rounded-xl object-cover border border-accent-main shadow-xs"
          />
          <div className="min-w-0">
            <span className="text-xs font-black text-text-primary uppercase tracking-tight truncate block">
              {review.customer?.name || 'Customer'}
            </span>
            <p className="text-[8px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Verified Customer</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <RatingStars rating={review.rating} size="xs" />
          <button
            onClick={() => setShowComment(!showComment)}
            className="text-[9px] font-bold text-accent-main hover:underline uppercase tracking-wider"
          >
            {showComment ? 'Hide Review' : 'Read Review'}
          </button>
        </div>
      </div>

      {showComment && (
        <div className="animate-fade-in pt-1">
          <p className="text-xs text-text-secondary leading-relaxed font-semibold italic">
            "{review.comment}"
          </p>
          {review.workerReply && (
            <div className="p-3 bg-white rounded-xl text-xs text-text-primary mt-3 border border-gray-200 ml-4">
              <span className="font-black text-accent-main block mb-1 uppercase tracking-wider text-[10px]">Worker's Reply:</span>
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
  const [workingHours, setWorkingHours] = useState('full-day');
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
        payload.scheduledTime = '00:00';
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
      <div className="min-h-screen bg-transparent flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent-main border-t-transparent" />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-28 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 border border-blue-100">
            <Sparkles className="w-10 h-10 text-accent-main" />
          </div>
          <h2 className="text-2xl font-sora font-black text-text-primary uppercase tracking-tight">Worker Not Found</h2>
          <p className="text-xs font-bold text-text-muted mt-2 mb-8 uppercase tracking-wider">We could not find the worker profile you are looking for.</p>
          <PremiumButton variant="gold" size="lg" onClick={() => navigate('/search')}>GO BACK TO SEARCH</PremiumButton>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-transparent flex flex-col relative overflow-hidden">
      <Navbar />

      <main className="pt-28 sm:pt-36 pb-20 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 relative z-10">
        {/* Profile Header */}
        <div className="relative rounded-[2.5rem] overflow-hidden mb-10 shadow-sm border border-white/60 group">
          <img
            src={getImageUrl(worker.coverImage, DEFAULT_COVER)}
            alt="Cover"
            onError={(e) => handleImageError(e, DEFAULT_COVER)}
            className="w-full h-60 md:h-80 object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F3F4F6] via-[#F3F4F6]/40 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6 text-text-primary">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              <div className="relative shrink-0">
                <img
                  src={getImageUrl(worker.avatar, DEFAULT_AVATAR(worker.name))}
                  alt={worker.name}
                  onError={(e) => handleImageError(e, DEFAULT_AVATAR(worker.name))}
                  className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-4 border-white shadow-md"
                />
                {worker.isAvailable && <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white shadow-xs" />}
              </div>
              <div className="min-w-0">
                <div className="flex flex-col sm:flex-row items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-4xl font-sora font-black text-text-primary tracking-tight uppercase truncate">{worker.name}</h1>
                  {worker.isVerified && (
                    <Badge variant="verified" size="sm" className="px-3 py-1 !rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" /> VERIFIED
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                   <div className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/60">
                      <span className="text-[10px] font-black text-accent-main uppercase tracking-wider">{worker.profession}</span>
                   </div>
                   {worker.category && (
                     <div className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/60">
                        <span className="text-[10px] font-black text-text-secondary uppercase tracking-wider">{worker.category.name}</span>
                     </div>
                   )}
                </div>
                <p className="text-xs font-bold text-text-secondary mt-3 flex items-center justify-center sm:justify-start gap-1.5 uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-accent-main" /> {worker.address?.city || 'City'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-end">
              <button
                onClick={handleStartChat}
                className="px-5 py-3 rounded-xl bg-white/80 hover:bg-white text-text-primary text-[11px] font-black flex items-center gap-2 shadow-xs backdrop-blur-md transition-all uppercase tracking-wider border border-white/60 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-accent-main" /> CHAT FOR PRICING
              </button>

              <button
                onClick={handleToggleFavorite}
                className={`px-5 py-3 rounded-xl text-[11px] font-black flex items-center gap-2 shadow-xs backdrop-blur-md transition-all uppercase tracking-wider border cursor-pointer ${
                  isFavorite
                    ? 'bg-red-50 text-red-600 border-red-200'
                    : 'bg-white/80 text-text-primary border-white/60 hover:bg-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500' : ''}`} />
                {isFavorite ? 'SAVED' : 'SAVE'}
              </button>

              <PremiumButton
                variant="gold"
                size="lg"
                onClick={() => setBookingModalOpen(true)}
                disabled={!worker.isAvailable}
                className="px-8 shadow-xs w-full sm:w-auto"
              >
                {worker.isAvailable ? 'BOOK NOW' : 'NOT AVAILABLE'}
              </PremiumButton>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <GlassCard goldBorder className="p-6 sm:p-8 rounded-[2rem] !bg-white/80 border border-white/60 shadow-xs relative overflow-hidden">
              <h3 className="font-sora font-black text-xl text-text-primary mb-4 uppercase tracking-tight flex items-center gap-3">
                 <div className="w-1.5 h-6 bg-accent-main rounded-full" /> BIO
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-semibold italic">
                 "{worker.description || 'Professional local service provider with years of experience.'}"
              </p>
            </GlassCard>

            {/* Portfolio */}
            {worker.portfolio?.length > 0 && (
              <GlassCard className="p-6 sm:p-8 rounded-[2rem] !bg-white/80 border border-white/60 shadow-xs">
                <h3 className="font-sora font-black text-xl text-text-primary mb-6 uppercase tracking-tight flex items-center gap-3">
                   <div className="w-1.5 h-6 bg-accent-main rounded-full" /> WORK PHOTOS
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {worker.portfolio.map((item, idx) => (
                    <div key={idx} className="flex flex-col rounded-2xl overflow-hidden border border-gray-200 bg-white hover:border-accent-main/40 transition-all group shadow-xs">
                      <div className="h-48 overflow-hidden bg-gray-100 relative">
                        <img
                          src={getImageUrl(item.url || item, DEFAULT_COVER)}
                          alt={item.title || `Work Photo ${idx}`}
                          onError={(e) => handleImageError(e, DEFAULT_COVER)}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <h4 className="font-sora font-black text-xs text-text-primary mb-1 uppercase tracking-tight">
                          {item.title || `Job Completion #${idx + 1}`}
                        </h4>
                        <p className="text-[11px] text-text-muted font-medium italic leading-relaxed line-clamp-2">
                          {item.description ? `"${item.description}"` : 'Photo of a successfully completed job.'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Reviews */}
            <GlassCard className="p-6 sm:p-8 rounded-[2rem] !bg-white/80 border border-white/60 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                  <h3 className="font-sora font-black text-xl text-text-primary uppercase tracking-tight flex items-center gap-3">
                     <div className="w-1.5 h-6 bg-accent-main rounded-full" /> REVIEWS
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <RatingStars rating={worker.rating || 0} size="xs" />
                    <span className="text-xs font-bold text-accent-main uppercase tracking-wider">({worker.rating || 0} Rating)</span>
                  </div>
                </div>

                {pendingBookingForReview && (
                  <PremiumButton variant="outline" size="sm" icon={Star} onClick={() => setReviewModalOpen(true)} className="px-5 font-black uppercase tracking-wider">
                    WRITE REVIEW
                  </PremiumButton>
                )}
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <ReviewItem key={r._id} review={r} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-blue-50/40 rounded-2xl border-2 border-dashed border-blue-100">
                   <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">NO REVIEWS YET.</p>
                </div>
              )}
            </GlassCard>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <GlassCard goldBorder className="p-6 sm:p-8 rounded-[2rem] space-y-5 !bg-white/80 border border-white/60 shadow-xs">
              <h3 className="font-sora font-black text-base text-text-primary border-b border-gray-100 pb-4 uppercase tracking-wider">
                DETAILS
              </h3>

              <div className="space-y-3">
                 <div className="flex items-center justify-between p-3.5 bg-blue-50/50 rounded-xl border border-blue-100/60">
                   <span className="text-[9px] font-black text-text-muted uppercase tracking-wider">STATUS</span>
                   <Badge variant="verified" size="xs" className="font-black">ACTIVE</Badge>
                 </div>

                 <div className="flex flex-col p-3.5 bg-blue-50/50 rounded-xl border border-blue-100/60 space-y-1">
                   <span className="text-[9px] font-black text-text-muted uppercase tracking-wider">PRICING</span>
                   <p className="text-xs font-black text-text-primary uppercase tracking-tight">Price varies by work</p>
                   <p className="text-[9px] text-accent-main font-bold uppercase tracking-wider">Contact worker for a quote</p>
                 </div>

                 <div className="flex items-center justify-between p-3.5 bg-blue-50/50 rounded-xl border border-blue-100/60">
                   <span className="text-[9px] font-black text-text-muted uppercase tracking-wider">EXPERIENCE</span>
                   <span className="font-black text-text-primary uppercase text-xs">{worker.experience || 0} YEARS</span>
                 </div>

                 <div className="flex items-center justify-between p-3.5 bg-blue-50/50 rounded-xl border border-blue-100/60">
                   <span className="text-[9px] font-black text-text-muted uppercase tracking-wider">JOBS COMPLETED</span>
                   <span className="font-black text-text-primary uppercase text-xs">{worker.completedJobs || 0} DONE</span>
                 </div>
              </div>

              <div className="pt-4 space-y-3">
                <button
                  onClick={handleStartChat}
                  className="w-full py-3 rounded-xl bg-blue-50 text-accent-main border border-blue-200 font-black text-[10px] uppercase tracking-widest shadow-xs hover:bg-blue-100 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 inline-block mr-2" /> CHAT FOR PRICING
                </button>

                <PremiumButton
                  variant="gold"
                  size="lg"
                  fullWidth
                  onClick={() => setBookingModalOpen(true)}
                  disabled={!worker.isAvailable}
                  className="py-4"
                >
                  {worker.isAvailable ? 'BOOK SERVICE' : 'BUSY'}
                </PremiumButton>
              </div>
            </GlassCard>

          </div>
        </div>
      </main>

      <Footer />

      {/* Booking Modal */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title={`Book Service: ${worker.name}`}
      >
        <form onSubmit={handleCreateBooking} className="space-y-6 pt-2">

          {/* Booking Type Toggle */}
          <div className="flex bg-blue-50/80 p-1.5 rounded-2xl border border-blue-100 mb-4">
             <button
               type="button"
               onClick={() => setBookingType('small')}
               className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 bookingType === 'small' ? 'bg-accent-main text-white shadow-xs' : 'text-text-muted hover:text-text-primary'
               }`}
             >
               <LayoutGrid className="w-4 h-4" /> Small Work
             </button>
             <button
               type="button"
               onClick={() => setBookingType('large')}
               className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 bookingType === 'large' ? 'bg-accent-main text-white shadow-xs' : 'text-text-muted hover:text-text-primary'
               }`}
             >
               <Maximize2 className="w-4 h-4" /> Large Work
             </button>
          </div>

          <div className="bg-white/60 p-5 rounded-2xl border border-white/60 space-y-4">

            {/* Small Work View */}
            {bookingType === 'small' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-accent-main uppercase tracking-widest ml-1">WORK DATE</label>
                    <div className="relative group cursor-pointer" onClick={(e) => {
                      const input = e.currentTarget.querySelector('input');
                      if (input) input.showPicker();
                    }}>
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-main z-10 pointer-events-none" />
                      <input
                        type="date"
                        min={today}
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl p-3 pl-10 text-xs font-black text-text-primary focus:outline-none focus:border-accent-main relative"
                        required
                      />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-accent-main uppercase tracking-widest ml-1">START TIME</label>
                    <div className="relative group cursor-pointer" onClick={(e) => {
                      const input = e.currentTarget.querySelector('input');
                      if (input) input.showPicker();
                    }}>
                      <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-main z-10 pointer-events-none" />
                      <input
                        type="time"
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl p-3 pl-10 text-xs font-black text-text-primary focus:outline-none focus:border-accent-main relative"
                        required
                      />
                    </div>
                </div>
              </div>
            ) : (
              /* Large Work View */
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <label className="text-[10px] font-black text-accent-main uppercase tracking-widest ml-1">START DATE</label>
                      <div className="relative group cursor-pointer" onClick={(e) => {
                        const input = e.currentTarget.querySelector('input');
                        if (input) input.showPicker();
                      }}>
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-main z-10 pointer-events-none" />
                        <input
                          type="date"
                          min={today}
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-xl p-3 pl-10 text-xs font-black text-text-primary focus:outline-none focus:border-accent-main relative"
                          required
                        />
                      </div>
                  </div>
                  <div className="space-y-2">
                      <label className="text-[10px] font-black text-accent-main uppercase tracking-widest ml-1">END DATE</label>
                      <div className="relative group cursor-pointer" onClick={(e) => {
                        const input = e.currentTarget.querySelector('input');
                        if (input) input.showPicker();
                      }}>
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-main z-10 pointer-events-none" />
                        <input
                          type="date"
                          min={bookingDate || today}
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-xl p-3 pl-10 text-xs font-black text-text-primary focus:outline-none focus:border-accent-main relative"
                          required
                        />
                      </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-accent-main uppercase tracking-widest ml-1">DAILY AVAILABILITY</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setWorkingHours('full-day')}
                      className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        workingHours === 'full-day' ? 'bg-blue-100 border-accent-main text-accent-main' : 'bg-white border-gray-200 text-text-muted'
                      }`}
                    >
                      Full Day
                    </button>
                    <button
                      type="button"
                      onClick={() => setWorkingHours('custom')}
                      className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        workingHours === 'custom' ? 'bg-blue-100 border-accent-main text-accent-main' : 'bg-white border-gray-200 text-text-muted'
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
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-black text-text-primary focus:outline-none focus:border-accent-main mt-2 uppercase tracking-widest"
                      required={workingHours === 'custom'}
                    />
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-accent-main uppercase tracking-widest ml-1">JOB DESCRIPTION</label>
              <textarea
                rows={3}
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                placeholder="Explain the work details here..."
                className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-xs font-bold focus:outline-none focus:border-accent-main text-text-primary"
                required
              />
            </div>

            <div className="space-y-3 pt-3 border-t border-gray-100">
              <label className="text-[10px] font-black text-text-primary uppercase tracking-widest block ml-1">ADDRESS</label>
              <div className="grid grid-cols-1 gap-3">
                <input
                  type="text"
                  placeholder="Street and Area"
                  value={serviceAddress.street}
                  onChange={(e) => setServiceAddress({...serviceAddress, street: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-bold text-text-primary focus:outline-none focus:border-accent-main"
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="City"
                    value={serviceAddress.city}
                    onChange={(e) => setServiceAddress({...serviceAddress, city: e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-bold text-text-primary focus:outline-none focus:border-accent-main"
                    required
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={serviceAddress.state}
                    onChange={(e) => setServiceAddress({...serviceAddress, state: e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-bold text-text-primary focus:outline-none focus:border-accent-main"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Pin Code"
                    value={serviceAddress.zip}
                    onChange={(e) => setServiceAddress({...serviceAddress, zip: e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-bold text-text-primary focus:outline-none focus:border-accent-main"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <PremiumButton type="submit" variant="gold" size="lg" fullWidth loading={bookingLoading} className="py-4 text-sm font-black uppercase tracking-wider">
            Confirm {bookingType === 'large' ? 'Project' : 'Booking'}
          </PremiumButton>
        </form>
      </Modal>
    </div>
  );
};

export default WorkerProfilePage;

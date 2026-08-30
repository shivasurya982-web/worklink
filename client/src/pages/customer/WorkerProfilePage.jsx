import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import GlassCard from '../../components/common/GlassCard';
import PremiumButton from '../../components/common/PremiumButton';
import Badge from '../../components/common/Badge';
import RatingStars from '../../components/common/RatingStars';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import API from '../../services/api';

/* ── Review Item Component with Toggle ── */
const ReviewItem = ({ review }) => {
  const [showComment, setShowComment] = useState(false);

  return (
    <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={review.customer?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.customer?.name || 'Customer')}&background=D4AF37&color=fff`}
            alt={review.customer?.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="text-xs font-semibold text-text-primary">
            {review.customer?.name || 'Customer'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <RatingStars rating={review.rating} size="xs" />
          <button
            onClick={() => setShowComment(!showComment)}
            className="text-[10px] font-bold text-accent-gold hover:underline flex items-center gap-0.5"
          >
            {showComment ? 'Hide Comment' : 'Read Comment'}
            {showComment ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
          </button>
        </div>
      </div>

      {showComment && (
        <div className="animate-fade-in pt-1">
          <p className="text-xs text-text-secondary leading-relaxed pl-10 border-l-2 border-accent-gold/20 italic">
            "{review.comment}"
          </p>
          {review.workerReply && (
            <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-900 mt-3 border border-amber-200 ml-10">
              <span className="font-bold text-accent-gold block mb-0.5">Worker Response:</span>
              "{review.workerReply}"
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
  const { isAuthenticated, role, user } = useAuth();
  const { showToast } = useNotification();

  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [pendingBookingForReview, setPendingBooking] = useState(null);

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

  // Booking Form State
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('10:00');
  const [workDescription, setWorkDescription] = useState('');
  const [serviceAddress, setServiceAddress] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zip: user?.address?.zip || '',
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  // Review Form State
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

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
      showToast('Login Required', 'Please login as a customer to save favorites.', 'info');
      navigate('/login');
      return;
    }
    try {
      if (isFavorite) {
        await API.delete(`/customers/favorites/${id}`);
        setIsFavorite(false);
        showToast('Removed', 'Professional removed from your favorites.', 'info');
      } else {
        await API.post(`/customers/favorites/${id}`);
        setIsFavorite(true);
        showToast('Saved!', 'Professional added to your favorites ❤️', 'success');
      }
    } catch (err) {
      showToast('Error', err.message || 'Could not update favorites.', 'error');
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Login Required', 'Please login as customer to book services.', 'info');
      navigate('/login');
      return;
    }

    setBookingLoading(true);
    try {
      const res = await API.post('/bookings', {
        worker: worker._id,
        scheduledDate: bookingDate,
        scheduledTime: bookingTime,
        description: workDescription,
        address: serviceAddress,
        estimatedCost: worker.pricing?.hourly || 350,
      });

      if (res.success) {
        showToast('Booking Request Sent!', 'Professional has been notified of your request.', 'success');
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
        showToast('Rating Submitted!', 'Thank you for reviewing this professional.', 'success');
        setReviewModalOpen(false);
        setNewComment('');
        setPendingBooking(null);
        fetchWorkerData();
      }
    } catch (err) {
      showToast('Review Error', err.message || 'Failed to post review', 'error');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleStartChat = () => {
    if (!isAuthenticated) {
      showToast('Login Required', 'Please login to chat with professionals.', 'info');
      navigate('/login');
      return;
    }
    navigate(`/customer/messages?worker=${worker._id}`);
  };

  const handleCallAction = (phoneNumber) => {
    if (!isAuthenticated) {
      showToast('Login Required', 'Please login to contact professionals.', 'info');
      navigate('/login');
      return;
    }

    if (!phoneNumber) return;
    const cleanNumber = phoneNumber.replace(/\s+/g, '');

    // Create link and click
    const link = document.createElement('a');
    link.href = `tel:${cleanNumber}`;
    link.click();

    // Laptop backup
    navigator.clipboard.writeText(cleanNumber);
    showToast('Dialing...', `Professional number ${phoneNumber} copied to clipboard as backup.`, 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-primary flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent-gold border-t-transparent" />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen bg-background-primary flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
          <Sparkles className="w-12 h-12 text-accent-gold mb-3 opacity-50" />
          <h2 className="text-xl font-sora font-bold text-text-primary">Professional Not Found</h2>
          <p className="text-xs text-text-muted mt-1 mb-4">This profile does not exist or has been removed.</p>
          <PremiumButton variant="gold" onClick={() => navigate('/search')}>Browse Professionals</PremiumButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary flex flex-col">
      <Navbar />

      <main className="pt-20 sm:pt-24 pb-16 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6">
        {/* Cover & Avatar Header */}
        <div className="relative rounded-3xl overflow-hidden mb-8 shadow-xl">
          <img
            src={worker.coverImage || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800'}
            alt="Cover"
            className="w-full h-56 md:h-72 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Floating Header Info */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4 text-white">
            <div className="flex items-end gap-4">
              <img
                src={worker.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}&background=D4AF37&color=fff`}
                alt={worker.name}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-white shadow-2xl shrink-0"
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl md:text-3xl font-sora font-bold text-white">{worker.name}</h1>
                  {worker.isVerified && (
                    <Badge variant="verified" size="sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent-gold" /> Verified Pro
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                   <Badge variant="gold" size="xs" className="px-3 py-1 font-bold uppercase tracking-wider">
                      {worker.profession}
                   </Badge>
                   {worker.category && (
                     <Badge variant="blue" size="xs" className="px-3 py-1 font-bold uppercase tracking-wider">
                        {worker.category.name}
                     </Badge>
                   )}
                </div>
                <p className="text-xs text-gray-200 mt-2 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {worker.address?.city || 'Local Area'}, {worker.address?.state || 'India'}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant={worker.isAvailable ? 'success' : 'danger'} size="xs">
                    <Circle className={`w-2 h-2 mr-1 ${worker.isAvailable ? 'fill-current' : ''}`} />
                    {worker.isAvailable ? 'Available Now' : 'Off Duty'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Quick Contact & Chat Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <button
                onClick={handleStartChat}
                className="px-4 py-2.5 rounded-full bg-accent-blue/90 hover:bg-accent-blue text-white text-xs font-bold flex items-center gap-1.5 shadow-md backdrop-blur-md transition-transform active:scale-95 min-h-[42px]"
              >
                <MessageSquare className="w-4 h-4" /> Chat Now
              </button>

              {/* ❤️ Favourite Button */}
              <button
                onClick={handleToggleFavorite}
                className={`px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md backdrop-blur-md transition-all active:scale-95 min-h-[42px] border ${
                  isFavorite
                    ? 'bg-red-500 text-white border-red-400 hover:bg-red-600'
                    : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                }`}
                title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
                {isFavorite ? 'Saved' : 'Favourite'}
              </button>

              {pendingBookingForReview && (
                <button
                  onClick={() => setReviewModalOpen(true)}
                  className="px-4 py-2.5 rounded-full bg-accent-gold hover:bg-amber-600 text-text-primary text-xs font-bold flex items-center gap-1.5 transition-all shadow-glow min-h-[42px] animate-pulse"
                >
                  <Star className="w-4 h-4 fill-text-primary" /> Rate Experience
                </button>
              )}

              <PremiumButton
                variant="gold"
                size="md"
                onClick={() => setBookingModalOpen(true)}
                disabled={!worker.isAvailable}
              >
                {worker.isAvailable ? 'Book Service' : 'Off Duty'}
              </PremiumButton>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* About */}
            <GlassCard goldBorder className="p-6 rounded-3xl">
              <h3 className="font-sora font-bold text-lg text-text-primary mb-3">About Professional</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{worker.description || 'Experienced local service provider.'}</p>
            </GlassCard>

            {/* Portfolio Grid */}
            {worker.portfolio?.length > 0 && (
              <GlassCard className="p-6 rounded-3xl">
                <h3 className="font-sora font-bold text-lg text-text-primary mb-4">Work Portfolio</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {worker.portfolio.map((item, idx) => (
                    <div key={idx} className="flex flex-col rounded-2xl overflow-hidden border border-gray-100 bg-gray-50/50 hover:bg-white transition-colors group">
                      <div className="h-40 overflow-hidden bg-gray-100">
                        <img
                          src={item.url || item}
                          alt={item.title || `Portfolio ${idx}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            e.target.src = 'https://placehold.co/400x300?text=Work+Sample';
                          }}
                        />
                      </div>
                      <div className="p-3">
                        <h4 className="font-sora font-bold text-xs text-text-primary mb-1">
                          {item.title || `Completed Job #${idx + 1}`}
                        </h4>
                        <p className="text-[10px] text-text-secondary line-clamp-2 italic leading-relaxed">
                          {item.description ? `"${item.description}"` : 'Professional service completion.'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Reviews Section */}
            <GlassCard className="p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h3 className="font-sora font-bold text-lg text-text-primary">
                    Customer Reviews ({worker.totalReviews || reviews.length})
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <RatingStars rating={worker.rating || 0} size="sm" />
                    <span className="text-xs font-bold text-accent-gold">({worker.rating || 0} / 5.0)</span>
                  </div>
                </div>

                {pendingBookingForReview && (
                  <PremiumButton variant="outline" size="sm" icon={Star} onClick={() => setReviewModalOpen(true)}>
                    Rate Your Experience
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
                <div className="text-center py-8 text-xs text-text-muted">
                  No reviews submitted yet. Be the first to rate this professional!
                </div>
              )}
            </GlassCard>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <GlassCard goldBorder className="p-6 rounded-3xl space-y-4">
              <h3 className="font-sora font-bold text-base text-text-primary border-b border-gray-100 pb-3">
                Service Overview
              </h3>

              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted font-medium">Category:</span>
                <span className="font-bold text-accent-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-100 capitalize">
                  {worker.category?.name || 'General Service'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Profession:</span>
                <span className="font-semibold text-accent-gold uppercase">{worker.profession}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Hourly Rate:</span>
                <span className="font-bold text-base text-accent-gold">
                  {worker.pricing?.currency || '₹'}{worker.pricing?.hourly || 0}/hr
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Experience:</span>
                <span className="font-semibold text-text-primary">{worker.experience || 0} Years</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Completed Jobs:</span>
                <span className="font-semibold text-text-primary">{worker.completedJobs || 0} Jobs</span>
              </div>

              <div className="pt-3 space-y-2">
                <button
                  onClick={handleStartChat}
                  className="w-full btn-ai py-3 rounded-full text-xs font-bold flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <MessageSquare className="w-4 h-4" /> Direct Chat
                </button>

                {/* Sidebar Favourite Button */}
                <button
                  onClick={handleToggleFavorite}
                  className={`w-full py-3 rounded-full text-xs font-bold flex items-center justify-center gap-2 min-h-[44px] border transition-all ${
                    isFavorite
                      ? 'bg-red-50 text-accent-red border-red-200 hover:bg-red-100'
                      : 'bg-gray-50 text-text-secondary border-gray-200 hover:bg-amber-50 hover:text-accent-gold hover:border-accent-gold/40'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-accent-red text-accent-red' : ''}`} />
                  {isFavorite ? 'Saved to Favorites' : 'Add to Favorites'}
                </button>

                <PremiumButton
                  variant="gold"
                  size="lg"
                  fullWidth
                  onClick={() => setBookingModalOpen(true)}
                  disabled={!worker.isAvailable}
                >
                  {worker.isAvailable ? 'Book Service Request' : 'Currently Unavailable'}
                </PremiumButton>
              </div>
            </GlassCard>

            {/* Service Location Map */}
            {worker.address?.coordinates?.coordinates &&
             worker.address.coordinates.coordinates[0] !== 0 && (
              <GlassCard goldBorder className="p-6 rounded-3xl space-y-4">
                <h3 className="font-sora font-bold text-base text-text-primary border-b border-gray-100 pb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent-gold" /> Service Location
                </h3>
                <div
                  id="worker-map"
                  className="h-48 w-full rounded-2xl border border-gray-100"
                />
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-text-muted">Exact location pinned by professional</span>
                  <button
                    onClick={() => {
                      const [lng, lat] = worker.address.coordinates.coordinates;
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
                    }}
                    className="text-accent-blue font-bold hover:underline"
                  >
                    Get Directions
                  </button>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </main>

      {/* Rating & Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={`Rate & Review ${worker.name}`}
      >
        <form onSubmit={handleSubmitReview} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-text-primary block mb-2">Select Star Rating (1 to 5)</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewRating(star)}
                  className="p-2 transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= newRating
                        ? 'fill-accent-gold text-accent-gold'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm font-bold text-accent-gold ml-2">{newRating} / 5</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-primary block mb-1">Your Review & Comments</label>
            <textarea
              rows={4}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your experience working with this professional..."
              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-accent-gold"
              required
            />
          </div>

          <PremiumButton type="submit" variant="gold" size="lg" fullWidth loading={reviewLoading}>
            Submit Rating & Review
          </PremiumButton>
        </form>
      </Modal>

      {/* Booking Modal */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title={`Book ${worker.name}`}
      >
        <form onSubmit={handleCreateBooking} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-text-primary block mb-1">Scheduled Date</label>
            <input
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-accent-gold"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-primary block mb-1">Scheduled Time</label>
            <input
              type="time"
              value={bookingTime}
              onChange={(e) => setBookingTime(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-accent-gold"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-primary block mb-1">Work Description</label>
            <textarea
              rows={3}
              value={workDescription}
              onChange={(e) => setWorkDescription(e.target.value)}
              placeholder="Describe the issue or service needed..."
              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-accent-gold"
              required
            />
          </div>

          <div className="space-y-3 pt-2 border-t border-gray-100">
            <label className="text-xs font-bold text-accent-gold uppercase tracking-wider block">Service Address</label>
            <input
              type="text"
              value={serviceAddress.street}
              onChange={(e) => setServiceAddress({...serviceAddress, street: e.target.value})}
              placeholder="Street Address"
              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-accent-gold"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={serviceAddress.city}
                onChange={(e) => setServiceAddress({...serviceAddress, city: e.target.value})}
                placeholder="City"
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-accent-gold"
                required
              />
              <input
                type="text"
                value={serviceAddress.state}
                onChange={(e) => setServiceAddress({...serviceAddress, state: e.target.value})}
                placeholder="State"
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-accent-gold"
                required
              />
            </div>
            <input
              type="text"
              value={serviceAddress.zip}
              onChange={(e) => setServiceAddress({...serviceAddress, zip: e.target.value})}
              placeholder="PIN Code"
              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-accent-gold"
              required
            />
          </div>

          <PremiumButton type="submit" variant="gold" size="lg" fullWidth loading={bookingLoading}>
            Confirm Booking Request
          </PremiumButton>
        </form>
      </Modal>
    </div>
  );
};

export default WorkerProfilePage;

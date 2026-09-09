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

/* ── Review Item Component ── */
const ReviewItem = ({ review }) => {
  const [showComment, setShowComment] = useState(false);

  return (
    <div className="p-6 rounded-[2rem] bg-background-dark/50 border border-white/5 space-y-4 shadow-inner">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={review.customer?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.customer?.name || 'Customer')}&background=F4510B&color=fff`}
            alt={review.customer?.name}
            className="w-10 h-10 rounded-xl object-cover border-2 border-accent-main shadow-xl"
          />
          <div>
            <span className="text-sm font-black text-white uppercase tracking-tight">
              {review.customer?.name || 'ANONYMOUS NODE'}
            </span>
            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-0.5">Verified Consumer</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <RatingStars rating={review.rating} size="xs" />
          <button
            onClick={() => setShowComment(!showComment)}
            className="text-[9px] font-black text-accent-bright hover:text-white transition-colors uppercase tracking-[0.2em]"
          >
            {showComment ? 'DECRYPT LOG' : 'READ LOG'}
          </button>
        </div>
      </div>

      {showComment && (
        <div className="animate-fade-in pt-2">
          <p className="text-xs text-text-secondary leading-relaxed pl-6 border-l-2 border-accent-orange font-bold italic opacity-90">
            "{review.comment}"
          </p>
          {review.workerReply && (
            <div className="p-4 bg-accent-orange/10 rounded-2xl text-xs text-accent-peach mt-4 border border-accent-orange/30 ml-6">
              <span className="font-black text-accent-bright block mb-2 uppercase tracking-widest">NODE RESPONSE:</span>
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
      showToast('Node Access Denied', 'Please initialize customer terminal to save modules.', 'info');
      navigate('/login');
      return;
    }
    try {
      if (isFavorite) {
        await API.delete(`/customers/favorites/${id}`);
        setIsFavorite(false);
        showToast('Purged', 'Professional removed from local registry.', 'info');
      } else {
        await API.post(`/customers/favorites/${id}`);
        setIsFavorite(true);
        showToast('Synchronized', 'Module pinned to your dashboard ❤️', 'success');
      }
    } catch (err) {
      showToast('Error', err.message || 'Registry update failed.', 'error');
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Access Denied', 'Initialize session to book requests.', 'info');
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
        showToast('Signal Broadcasted!', 'Professional node notified of request.', 'success');
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
        showToast('Data Synced', 'Quality audit recorded.', 'success');
        setReviewModalOpen(false);
        setNewComment('');
        setPendingBooking(null);
        fetchWorkerData();
      }
    } catch (err) {
      showToast('Audit Error', err.message || 'Failed to record audit', 'error');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleStartChat = () => {
    if (!isAuthenticated) {
      showToast('Link Failed', 'Initialize session to establish comms.', 'info');
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
          <h2 className="text-3xl font-sora font-black text-white uppercase tracking-tighter">Node Not Found</h2>
          <p className="text-xs font-black text-text-muted mt-2 mb-10 uppercase tracking-widest opacity-80">THIS PROFESSIONAL MODULE IS NO LONGER DETECTABLE ON THE NETWORK.</p>
          <PremiumButton variant="gold" size="lg" onClick={() => navigate('/search')}>BACK TO DIRECTORY</PremiumButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary flex flex-col relative overflow-hidden">
      {/* Atmosphere */}
      <div className="absolute top-0 right-0 w-full h-[600px] bg-accent-orange/10 blur-[150px] pointer-events-none" />

      <Navbar />

      <main className="pt-28 sm:pt-36 pb-24 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 relative z-10">
        {/* Cover & Header */}
        <div className="relative rounded-[3rem] overflow-hidden mb-12 shadow-[0_30px_100px_rgba(0,0,0,0.7)] border-4 border-white/5 group">
          <img
            src={worker.coverImage || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200'}
            alt="Cover"
            className="w-full h-64 md:h-96 object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/30 to-transparent" />

          {/* Floating Header Info */}
          <div className="absolute bottom-8 left-8 right-8 flex flex-col lg:flex-row lg:items-end justify-between gap-8 text-white">
            <div className="flex items-end gap-6">
              <div className="relative shrink-0">
                <img
                  src={worker.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}&background=F4510B&color=fff`}
                  alt={worker.name}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] object-cover border-4 border-accent-main shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                />
                {worker.isAvailable && <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent-green rounded-2xl border-4 border-background-dark shadow-2xl animate-pulse" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-4 flex-wrap">
                  <h1 className="text-3xl md:text-5xl font-sora font-black text-white tracking-tighter uppercase">{worker.name}</h1>
                  {worker.isVerified && (
                    <Badge variant="verified" size="sm" className="px-4 py-1.5 !rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-accent-bright" /> VERIFIED NODE
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-4">
                   <div className="bg-background-dark/50 backdrop-blur-xl px-4 py-1.5 rounded-xl border border-white/10">
                      <span className="text-[10px] font-black text-accent-bright uppercase tracking-widest">{worker.profession}</span>
                   </div>
                   {worker.category && (
                     <div className="bg-background-dark/50 backdrop-blur-xl px-4 py-1.5 rounded-xl border border-white/10">
                        <span className="text-[10px] font-black text-accent-light uppercase tracking-widest">{worker.category.name}</span>
                     </div>
                   )}
                </div>
                <p className="text-xs font-black text-white mt-4 flex items-center gap-2 uppercase tracking-[0.2em] opacity-90">
                  <MapPin className="w-4 h-4 text-accent-bright" /> {worker.address?.city || 'LOCAL SECTOR'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleStartChat}
                className="px-6 py-3.5 rounded-2xl bg-background-widget/80 hover:bg-accent-orange text-white text-[11px] font-black flex items-center gap-2.5 shadow-2xl backdrop-blur-md transition-all uppercase tracking-widest border border-white/10"
              >
                <MessageSquare className="w-5 h-5" /> SYNC COMMS
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
                {isFavorite ? 'PINNED' : 'PIN MODULE'}
              </button>

              <PremiumButton
                variant="gold"
                size="lg"
                onClick={() => setBookingModalOpen(true)}
                disabled={!worker.isAvailable}
                className="px-10 shadow-orange"
              >
                {worker.isAvailable ? 'INITIALIZE BOOKING' : 'NODE OFFLINE'}
              </PremiumButton>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-10">
            {/* About */}
            <GlassCard goldBorder className="p-8 sm:p-10 rounded-[3rem] !bg-background-card border-border-primary/40 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-accent-orange/5 blur-3xl pointer-events-none" />
              <h3 className="font-sora font-black text-2xl text-white mb-6 uppercase tracking-tighter flex items-center gap-4">
                 <div className="w-1.5 h-8 bg-accent-bright rounded-full" /> NODE SPECIFICATION
              </h3>
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed font-bold italic opacity-90">
                 "{worker.description || 'ELITE LOCAL SERVICE PROVIDER WITH VALIDATED MARKET CREDENTIALS.'}"
              </p>
            </GlassCard>

            {/* Portfolio Grid */}
            {worker.portfolio?.length > 0 && (
              <GlassCard className="p-8 sm:p-10 rounded-[3rem] !bg-background-card border-border-primary/40 shadow-2xl">
                <h3 className="font-sora font-black text-2xl text-white mb-10 uppercase tracking-tighter flex items-center gap-4">
                   <div className="w-1.5 h-8 bg-accent-main rounded-full" /> OPERATIONAL ARTIFACTS
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {worker.portfolio.map((item, idx) => (
                    <div key={idx} className="flex flex-col rounded-[2rem] overflow-hidden border-2 border-white/5 bg-background-dark/40 hover:bg-background-dark/60 transition-all duration-500 group shadow-2xl">
                      <div className="h-56 overflow-hidden bg-background-widget relative">
                        <img
                          src={item.url || item}
                          alt={item.title || `Module ${idx}`}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-accent-orange/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="p-6">
                        <h4 className="font-sora font-black text-sm text-white mb-2 uppercase tracking-tight">
                          {item.title || `SUCCESSFUL COMPLETION #${idx + 1}`}
                        </h4>
                        <p className="text-[11px] text-text-muted font-bold italic leading-relaxed line-clamp-2">
                          {item.description ? `"${item.description}"` : 'DOCUMENTED PROFESSIONAL SERVICE EXECUTION.'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Reviews Section */}
            <GlassCard className="p-8 sm:p-10 rounded-[3rem] !bg-background-card border-border-primary/40 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-6">
                <div>
                  <h3 className="font-sora font-black text-2xl text-white uppercase tracking-tighter flex items-center gap-4">
                     <div className="w-1.5 h-8 bg-accent-gold rounded-full" /> QUALITY AUDITS
                  </h3>
                  <div className="flex items-center gap-3 mt-3">
                    <RatingStars rating={worker.rating || 0} size="sm" />
                    <span className="text-xs font-black text-accent-bright uppercase tracking-widest">({worker.rating || 0} INDEX)</span>
                  </div>
                </div>

                {pendingBookingForReview && (
                  <PremiumButton variant="outline" size="sm" icon={Star} onClick={() => setReviewModalOpen(true)} className="px-6 font-black uppercase tracking-widest">
                    POST AUDIT
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
                <div className="text-center py-20 bg-background-dark/30 rounded-[2rem] border-2 border-dashed border-white/5 opacity-40">
                   <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">NO EXTERNAL AUDITS RECORDED.</p>
                </div>
              )}
            </GlassCard>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <GlassCard goldBorder className="p-8 rounded-[2.5rem] space-y-6 !bg-background-card border-border-primary/40 shadow-2xl">
              <h3 className="font-sora font-black text-lg text-white border-b border-white/5 pb-5 uppercase tracking-widest">
                METRICS OVERVIEW
              </h3>

              <div className="space-y-5">
                 <div className="flex items-center justify-between p-4 bg-background-dark/40 rounded-2xl border border-white/5">
                   <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">STATUS</span>
                   <Badge variant="verified" size="xs" className="!bg-accent-orange/20 text-accent-bright font-black">ACTIVE MODULE</Badge>
                 </div>

                 <div className="flex items-center justify-between p-4 bg-background-dark/40 rounded-2xl border border-white/5">
                   <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">UNIT RATE</span>
                   <span className="font-black text-lg text-accent-bright tracking-tighter">₹{worker.pricing?.hourly || 0}<span className="text-[10px] ml-1 opacity-70">/HR</span></span>
                 </div>

                 <div className="flex items-center justify-between p-4 bg-background-dark/40 rounded-2xl border border-white/5">
                   <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">EXPERIENCE</span>
                   <span className="font-black text-white uppercase text-xs">{worker.experience || 0} CYCLES</span>
                 </div>

                 <div className="flex items-center justify-between p-4 bg-background-dark/40 rounded-2xl border border-white/5">
                   <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">CAPACITY</span>
                   <span className="font-black text-white uppercase text-xs">{worker.completedJobs || 0} SUCCESSFUL</span>
                 </div>
              </div>

              <div className="pt-6 space-y-4">
                <button
                  onClick={handleStartChat}
                  className="w-full py-4 rounded-2xl bg-background-widget text-accent-bright border-2 border-border-primary/30 font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-background-secondary transition-all"
                >
                  <MessageSquare className="w-5 h-5 inline-block mr-2" /> Direct Comms
                </button>

                <PremiumButton
                  variant="gold"
                  size="lg"
                  fullWidth
                  onClick={() => setBookingModalOpen(true)}
                  disabled={!worker.isAvailable}
                  className="shadow-orange py-5"
                >
                  {worker.isAvailable ? 'REQUEST SERVICE' : 'LINK SUPPRESSED'}
                </PremiumButton>
              </div>
            </GlassCard>

            {/* Service Location Map Placeholder */}
            {worker.address?.city && (
              <GlassCard goldBorder className="p-8 rounded-[2.5rem] space-y-6 !bg-background-cardSecondary border-border-primary/40 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-accent-orange/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="font-sora font-black text-lg text-white border-b border-white/5 pb-5 flex items-center gap-3 uppercase tracking-widest relative z-10">
                  <MapPin className="w-6 h-6 text-accent-bright" /> GEO ZONE
                </h3>

                <div className="h-48 w-full rounded-3xl bg-background-dark border-2 border-white/5 flex items-center justify-center relative z-10 shadow-inner group-hover:border-accent-orange/20 transition-all duration-500">
                    <div className="text-center space-y-3 px-6">
                       <MapPin className="w-10 h-10 text-accent-bright mx-auto animate-bounce" />
                       <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] leading-relaxed">PRIMARY NODE COORDINATES REGISTERED IN {worker.address.city.toUpperCase()}</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 relative z-10 pt-2">
                  <button
                    onClick={() => {
                      const addr = `${worker.address.street}, ${worker.address.city}`;
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}`);
                    }}
                    className="w-full py-3 rounded-xl bg-background-dark/80 text-white font-black text-[10px] uppercase tracking-[0.2em] border border-white/5 hover:border-accent-bright transition-all shadow-xl"
                  >
                    GENERATE ROUTE
                  </button>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Booking Modal */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title={`SERVICE INITIALIZATION: ${worker.name}`}
      >
        <form onSubmit={handleCreateBooking} className="space-y-10 pt-6">
          <div className="bg-background-dark/50 p-8 rounded-[2.5rem] border border-white/5 shadow-inner space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-accent-bright uppercase tracking-widest ml-1">DEPLOYMENT DATE</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-background-card border-2 border-border-primary/40 rounded-2xl p-4 text-xs font-black text-white focus:outline-none focus:border-accent-main shadow-2xl"
                    required
                  />
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-accent-bright uppercase tracking-widest ml-1">START WINDOW</label>
                  <input
                    type="time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full bg-background-card border-2 border-border-primary/40 rounded-2xl p-4 text-xs font-black text-white focus:outline-none focus:border-accent-main shadow-2xl"
                    required
                  />
               </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-accent-bright uppercase tracking-widest ml-1">SERVICE SPECIFICATIONS</label>
              <textarea
                rows={4}
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                placeholder="DESCRIBE OPERATIONAL REQUIREMENTS..."
                className="w-full bg-background-card border-2 border-border-primary/40 rounded-[2rem] p-5 text-sm font-bold focus:outline-none focus:border-accent-main text-white shadow-2xl"
                required
              />
            </div>

            <div className="space-y-6 pt-4 border-t border-white/5">
              <label className="text-[11px] font-black text-white uppercase tracking-[0.3em] block mb-4 ml-1">DESTINATION COORDINATES</label>
              <FloatingInput
                id="street"
                label="STREET NODE"
                value={serviceAddress.street}
                onChange={(e) => setServiceAddress({...serviceAddress, street: e.target.value})}
                required
                className="!bg-background-card border-border-primary/30"
              />
              <div className="grid grid-cols-2 gap-4">
                <FloatingInput
                  id="city"
                  label="CITY"
                  value={serviceAddress.city}
                  onChange={(e) => setServiceAddress({...serviceAddress, city: e.target.value})}
                  required
                  className="!bg-background-card border-border-primary/30"
                />
                <FloatingInput
                  id="state"
                  label="REGION"
                  value={serviceAddress.state}
                  onChange={(e) => setServiceAddress({...serviceAddress, state: e.target.value})}
                  required
                  className="!bg-background-card border-border-primary/30"
                />
              </div>
            </div>
          </div>

          <PremiumButton type="submit" variant="gold" size="lg" fullWidth loading={bookingLoading} className="py-5 text-base font-black shadow-orange">
            EXECUTE BROADCAST REQUEST
          </PremiumButton>
        </form>
      </Modal>
    </div>
  );
};

export default WorkerProfilePage;

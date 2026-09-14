import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import Badge from '../../components/common/Badge';
import PremiumButton from '../../components/common/PremiumButton';
import RatingStars from '../../components/common/RatingStars';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import { Calendar, Clock, MapPin, AlertCircle, MessageSquare, Star, Trash2, Maximize2, LayoutGrid } from 'lucide-react';
import API from '../../services/api';

const CustomerBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const { showToast } = useNotification();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await API.get('/bookings');
      if (res.success) {
        setBookings(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Are you sure you want to remove this booking from your history?')) return;
    try {
      const res = await API.delete(`/bookings/${id}`);
      if (res.success) {
        setBookings(prev => prev.filter(b => b._id !== id));
        showToast('Booking Removed', 'Booking history updated.', 'success');
      }
    } catch (err) {
      showToast('Error', err.message || 'Could not delete booking', 'error');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    const reason = prompt('Please enter the reason for cancellation:');
    if (reason === null) return;

    try {
      const res = await API.put(`/bookings/${bookingId}/cancel`, { reason });
      if (res.success) {
        showToast('Booking Cancelled', 'Your booking request was cancelled successfully.', 'info');
        fetchBookings();
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleOpenReviewModal = (booking) => {
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
        fetchBookings();
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Booking Registry"
      subtitle="View, track, and audit your service requirements"
    >
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent-bright border-t-transparent shadow-orange" />
        </div>
      ) : bookings.length > 0 ? (
        <div className="space-y-5">
          {bookings.map((booking) => (
            <GlassCard key={booking._id} hover={false} className="!bg-background-card p-6 border-border-primary/40 shadow-2xl relative overflow-hidden">
               {/* Background Hint */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-accent-orange/5 blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                {/* Worker Details */}
                <div
                  className="flex items-center gap-5 cursor-pointer group"
                  onClick={() => navigate(`/workers/${booking.worker?._id}`)}
                >
                  <div className="relative shrink-0">
                    <img
                      src={booking.worker?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.worker?.name || 'Pro')}&background=F4510B&color=fff`}
                      alt={booking.worker?.name}
                      className="w-16 h-16 rounded-[1.5rem] object-cover border-2 border-accent-main group-hover:border-accent-bright transition-all shadow-xl"
                    />
                    <div className="absolute inset-0 bg-accent-orange/10 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                       <h4 className="font-sora font-black text-base text-white group-hover:text-accent-bright transition-colors uppercase tracking-tight">
                        {booking.worker?.name}
                      </h4>
                      <Badge variant="gold" size="xs" className="!rounded-lg px-2 py-0.5 font-black text-[8px] uppercase">
                        {booking.bookingType === 'large' ? <><Maximize2 className="w-2.5 h-2.5 inline-block mr-1" /> Large</> : <><LayoutGrid className="w-2.5 h-2.5 inline-block mr-1" /> Small</>}
                      </Badge>
                    </div>
                    <p className="text-[10px] font-black text-accent-light uppercase tracking-widest mt-1 opacity-80">{booking.worker?.profession}</p>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
                      {booking.bookingType === 'large' ? (
                        <>
                          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-accent-bright" /> {new Date(booking.scheduledDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-accent-light" /> {booking.workingHours}</span>
                        </>
                      ) : (
                        <>
                          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-accent-bright" /> {new Date(booking.scheduledDate).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-accent-light" /> {booking.scheduledTime}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex flex-col sm:items-end gap-5 shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Status:</span>
                    <Badge
                      variant={
                        booking.status === 'completed'
                          ? 'success'
                          : booking.status === 'pending'
                          ? 'warning'
                          : booking.status === 'cancelled'
                          ? 'danger'
                          : 'blue'
                      }
                      size="sm"
                      className="!rounded-xl px-4 py-1.5"
                    >
                      {booking.status.toUpperCase().replace(/_/g, ' ')}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3">
                    <PremiumButton
                      variant="outline"
                      size="sm"
                      icon={MessageSquare}
                      onClick={() => navigate(`/customer/messages?worker=${booking.worker?._id}`)}
                      className="px-5 !rounded-xl"
                    >
                      Chat
                    </PremiumButton>

                    {['pending', 'accepted'].includes(booking.status) && (
                      <PremiumButton
                        variant="danger"
                        size="sm"
                        onClick={() => handleCancelBooking(booking._id)}
                        className="px-5 !rounded-xl"
                      >
                        Cancel
                      </PremiumButton>
                    )}

                    {booking.status === 'completed' && !booking.isReviewed && (
                      <PremiumButton
                        variant="gold"
                        size="sm"
                        icon={Star}
                        onClick={() => handleOpenReviewModal(booking)}
                        className="px-5 !rounded-xl shadow-orange"
                      >
                        Rate
                      </PremiumButton>
                    )}

                    {(booking.status === 'completed' || booking.status === 'cancelled') && (
                      <button
                        onClick={() => handleDeleteBooking(booking._id)}
                        className="p-3 rounded-xl bg-red-950/20 text-red-400 border border-red-500/20 hover:bg-red-900/30 transition-all shadow-lg"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Booking Address & Details */}
              <div className="mt-6 pt-6 border-t border-border-primary/10 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-text-secondary relative z-10">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4.5 h-4.5 text-accent-bright shrink-0" />
                  <span className="font-bold opacity-90 leading-relaxed uppercase tracking-widest text-[10px]">
                    {booking.address?.street}, {booking.address?.city}, {booking.address?.state}
                  </span>
                </div>
                {booking.description && (
                  <div className="bg-background-cardSecondary/60 p-4 rounded-2xl border border-border-primary/10">
                    <span className="text-[9px] font-black block text-accent-light mb-2 uppercase tracking-widest">Details:</span>
                    <p className="text-[11px] font-medium leading-relaxed italic">"{booking.description}"</p>
                  </div>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-background-cardSecondary/50 rounded-[3rem] border-2 border-dashed border-border-primary/20">
           <div className="w-20 h-20 bg-background-dark rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/5">
              <Calendar className="w-10 h-10 text-accent-bright opacity-20" />
           </div>
           <h4 className="font-sora font-black text-xl text-white mb-3">No Operational Records</h4>
           <p className="text-sm text-text-muted max-w-[320px] mx-auto leading-relaxed font-bold uppercase tracking-widest opacity-80 mb-10">Initialize your first service scan to populate this registry.</p>
           <PremiumButton variant="gold" size="lg" onClick={() => navigate('/customer/search')}>FIND PROFESSIONALS</PremiumButton>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && (
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title={`SERVICE AUDIT: ${selectedBooking?.worker?.name}`}
        >
          <form onSubmit={handleSubmitReview} className="space-y-8 pt-4">
            <div className="bg-background-dark/80 p-8 rounded-[2rem] border border-white/5 shadow-2xl">
              <label className="text-[11px] font-black text-accent-bright uppercase tracking-[0.4em] block mb-6 text-center">
                Quality Index Rating
              </label>
              <div className="flex justify-center scale-125">
                <RatingStars
                  rating={rating}
                  interactive={true}
                  onChange={(stars) => setRating(stars)}
                  size="lg"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-white uppercase tracking-[0.3em] block mb-4 ml-2">
                Detailed Feedback
              </label>
              <textarea
                rows={5}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Submit your assessment of the service outcome..."
                className="w-full bg-background-cardSecondary border-2 border-border-primary/30 rounded-[2rem] p-6 text-sm font-bold focus:outline-none focus:border-accent-main text-white shadow-2xl"
                required
              />
            </div>

            <PremiumButton
              type="submit"
              variant="gold"
              size="lg"
              fullWidth
              loading={reviewLoading}
              className="py-5 text-base shadow-orange"
            >
              FINALIZE REVIEW
            </PremiumButton>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default CustomerBookings;

import { getImageUrl, handleImageError, DEFAULT_AVATAR } from '../../utils/imageUtils';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import Badge from '../../components/common/Badge';
import PremiumButton from '../../components/common/PremiumButton';
import RatingStars from '../../components/common/RatingStars';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import { Calendar, Clock, MapPin, MessageSquare, Star, Trash2, Maximize2, LayoutGrid } from 'lucide-react';
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
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-main border-t-transparent" />
        </div>
      ) : bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <GlassCard key={booking._id} hover={false} className="!bg-white/80 p-6 border border-white/60 shadow-xs relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                {/* Worker Details */}
                <div
                  className="flex items-center gap-4 cursor-pointer group"
                  onClick={() => navigate(`/workers/${booking.worker?._id}`)}
                >
                  <div className="relative shrink-0">
                    <img
                      src={getImageUrl(booking.worker?.avatar, DEFAULT_AVATAR(booking.worker?.name || 'Pro'))} onError={(e) => handleImageError(e, DEFAULT_AVATAR(booking.worker?.name || 'Pro'))}
                      alt={booking.worker?.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-accent-main transition-all shadow-xs"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                       <h4 className="font-sora font-black text-base text-text-primary group-hover:text-accent-main transition-colors uppercase tracking-tight">
                        {booking.worker?.name}
                      </h4>
                      <Badge variant="gold" size="xs" className="!rounded-lg px-2 py-0.5 font-black text-[8px] uppercase">
                        {booking.bookingType === 'large' ? <><Maximize2 className="w-2.5 h-2.5 inline-block mr-1" /> Large</> : <><LayoutGrid className="w-2.5 h-2.5 inline-block mr-1" /> Small</>}
                      </Badge>
                    </div>
                    <p className="text-[10px] font-bold text-accent-main uppercase tracking-wider mt-0.5">{booking.worker?.profession}</p>

                    <div className="flex flex-wrap items-center gap-4 mt-2 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      {booking.bookingType === 'large' ? (
                        <>
                          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-accent-main" /> {new Date(booking.scheduledDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-accent-main" /> {booking.workingHours}</span>
                        </>
                      ) : (
                        <>
                          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-accent-main" /> {new Date(booking.scheduledDate).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-accent-main" /> {booking.scheduledTime}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex flex-col sm:items-end gap-4 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Status:</span>
                    <Badge
                      variant={
                        booking.status === 'completed'
                          ? 'success'
                          : booking.status === 'pending'
                          ? 'warning'
                          : booking.status === 'cancelled'
                          ? 'danger'
                          : 'orange'
                      }
                      size="sm"
                      className="!rounded-xl px-3 py-1"
                    >
                      {booking.status.toUpperCase().replace(/_/g, ' ')}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <PremiumButton
                      variant="outline"
                      size="sm"
                      icon={MessageSquare}
                      onClick={() => navigate(`/customer/messages?worker=${booking.worker?._id}`)}
                      className="px-4 !rounded-xl"
                    >
                      Chat
                    </PremiumButton>

                    {['pending', 'accepted'].includes(booking.status) && (
                      <PremiumButton
                        variant="danger"
                        size="sm"
                        onClick={() => handleCancelBooking(booking._id)}
                        className="px-4 !rounded-xl"
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
                        className="px-4 !rounded-xl"
                      >
                        Rate
                      </PremiumButton>
                    )}

                    {(booking.status === 'completed' || booking.status === 'cancelled') && (
                      <button
                        onClick={() => handleDeleteBooking(booking._id)}
                        className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all shadow-xs"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Booking Address & Details */}
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-text-secondary relative z-10">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-accent-main shrink-0" />
                  <span className="font-semibold leading-relaxed uppercase tracking-wider text-[10px] text-text-primary">
                    {booking.address?.street}, {booking.address?.city}, {booking.address?.state}
                  </span>
                </div>
                {booking.description && (
                  <div className="bg-orange-50/50 p-3 rounded-xl border border-orange-100/60">
                    <span className="text-[9px] font-black block text-accent-main mb-1 uppercase tracking-wider">Details:</span>
                    <p className="text-[11px] font-medium italic">"{booking.description}"</p>
                  </div>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white/60 rounded-[2.5rem] border-2 border-dashed border-gray-200">
           <div className="w-16 h-16 bg-orange-50/80 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-orange-100/80">
              <Calendar className="w-8 h-8 text-accent-main" />
           </div>
           <h4 className="font-sora font-black text-lg text-text-primary mb-2 uppercase tracking-tight">No Bookings Found</h4>
           <p className="text-xs text-text-muted max-w-[280px] mx-auto leading-relaxed font-semibold uppercase tracking-wider mb-6">Find and book professionals near you.</p>
           <PremiumButton variant="black" size="lg" onClick={() => navigate('/customer/search')}>FIND PROFESSIONALS</PremiumButton>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && (
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title={`REVIEW: ${selectedBooking?.worker?.name}`}
        >
          <form onSubmit={handleSubmitReview} className="space-y-6 pt-2">
            <div className="bg-orange-50/60 p-6 rounded-2xl border border-orange-100/80">
              <label className="text-[10px] font-black text-accent-main uppercase tracking-widest block mb-4 text-center">
                Quality Index Rating
              </label>
              <div className="flex justify-center">
                <RatingStars
                  rating={rating}
                  interactive={true}
                  onChange={(stars) => setRating(stars)}
                  size="lg"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-text-primary uppercase tracking-wider block mb-2">
                Detailed Feedback
              </label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Submit your assessment of the service outcome..."
                className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-xs font-bold focus:outline-none focus:border-accent-main text-text-primary"
                required
              />
            </div>

            <PremiumButton
              type="submit"
              variant="gold"
              size="lg"
              fullWidth
              loading={reviewLoading}
              className="py-4 text-sm"
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

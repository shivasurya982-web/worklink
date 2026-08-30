import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import Badge from '../../components/common/Badge';
import PremiumButton from '../../components/common/PremiumButton';
import RatingStars from '../../components/common/RatingStars';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import { Calendar, Clock, MapPin, AlertCircle, MessageSquare, Star, Trash2 } from 'lucide-react';
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
    if (reason === null) return; // user cancelled prompt

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
      title="Booking History"
      subtitle="View, track, and review your service requests"
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-gold border-t-transparent" />
        </div>
      ) : bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <GlassCard key={booking._id} hover={false} className="p-6 border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Worker Details */}
                <div
                  className="flex items-center gap-4 cursor-pointer group"
                  onClick={() => navigate(`/workers/${booking.worker?._id}`)}
                >
                  <div className="relative">
                    <img
                      src={booking.worker?.avatar || 'https://placehold.co/60'}
                      alt={booking.worker?.name}
                      className="w-14 h-14 rounded-full object-cover border border-accent-gold/40 group-hover:border-accent-gold transition-colors"
                    />
                    <div className="absolute inset-0 bg-black/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div>
                    <h4 className="font-sora font-semibold text-sm text-text-primary group-hover:text-accent-gold transition-colors">
                      {booking.worker?.name}
                    </h4>
                    <p className="text-xs text-text-muted">{booking.worker?.profession}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
                      <Calendar className="w-3.5 h-3.5 text-accent-gold" />
                      <span>{new Date(booking.scheduledDate).toLocaleDateString()}</span>
                      <Clock className="w-3.5 h-3.5 text-accent-blue ml-2" />
                      <span>{booking.scheduledTime}</span>
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex flex-col sm:items-end gap-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted">Status:</span>
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
                    >
                      {booking.status.toUpperCase().replace(/_/g, ' ')}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Chat shortcut */}
                    <PremiumButton
                      variant="outline"
                      size="sm"
                      icon={MessageSquare}
                      onClick={() => navigate(`/customer/messages?worker=${booking.worker?._id}`)}
                    >
                      Chat
                    </PremiumButton>

                    {/* Cancel action */}
                    {['pending', 'accepted'].includes(booking.status) && (
                      <PremiumButton
                        variant="danger"
                        size="sm"
                        onClick={() => handleCancelBooking(booking._id)}
                      >
                        Cancel
                      </PremiumButton>
                    )}

                    {/* Review action */}
                    {booking.status === 'completed' && !booking.isReviewed && (
                      <PremiumButton
                        variant="gold"
                        size="sm"
                        icon={Star}
                        onClick={() => handleOpenReviewModal(booking)}
                      >
                        Rate Worker
                      </PremiumButton>
                    )}

                    {/* Delete action */}
                    {(booking.status === 'completed' || booking.status === 'cancelled') && (
                      <button
                        onClick={() => handleDeleteBooking(booking._id)}
                        className="p-2 rounded-xl bg-red-50 text-accent-red hover:bg-red-100 transition-colors shadow-sm"
                        title="Delete History"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Booking Address & Details */}
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-text-secondary">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-accent-gold shrink-0 mt-0.5" />
                  <span>
                    {booking.address?.street}, {booking.address?.city}, {booking.address?.state}
                  </span>
                </div>
                {booking.description && (
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <span className="font-semibold block text-text-primary mb-0.5">Details:</span>
                    {booking.description}
                  </div>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="text-center py-12 text-xs text-text-muted">
          No service bookings found. Click "Find Workers" in the sidebar to book your first service!
        </GlassCard>
      )}

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
    </DashboardLayout>
  );
};

export default CustomerBookings;

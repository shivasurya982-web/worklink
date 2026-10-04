import { getImageUrl, handleImageError, DEFAULT_AVATAR } from '../../utils/imageUtils';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import Badge from '../../components/common/Badge';
import PremiumButton from '../../components/common/PremiumButton';
import { useNotification } from '../../context/NotificationContext';
import { Calendar, Clock, MapPin, CheckCircle, MessageSquare, Trash2, AlertCircle, Phone, Maximize2, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

const WorkerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotification();
  const navigate = useNavigate();

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

  const handleUpdateStatus = async (bookingId, newStatus) => {
    let finalCost;
    if (newStatus === 'completed') {
      const input = prompt('Enter final job price (₹):');
      if (input === null) return;
      finalCost = parseInt(input || '0');
    }

    try {
      const res = await API.put(`/bookings/${bookingId}/status`, {
        status: newStatus,
        finalCost,
      });

      if (res.success) {
        showToast('Success', `Job marked as ${newStatus}.`, 'success');
        fetchBookings();
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Delete this booking record?')) return;
    try {
      const res = await API.delete(`/bookings/${id}`);
      if (res.success) {
        setBookings(prev => prev.filter(b => b._id !== id));
        showToast('Deleted', 'Record removed.', 'info');
      }
    } catch (err) {
      showToast('Error', err.message || 'Delete failed', 'error');
    }
  };

  const pendingJobs = bookings.filter(b => b.status === 'pending');
  const otherJobs = bookings.filter(b => b.status !== 'pending');

  return (
    <DashboardLayout
      title="My Bookings"
      subtitle="Manage your current and past work assignments"
    >
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-main border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-10">
          {/* New Requests Section */}
          {pendingJobs.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-sora font-black text-xl text-text-primary flex items-center gap-3 tracking-tight">
                <AlertCircle className="w-6 h-6 text-accent-main animate-pulse" /> NEW REQUESTS
              </h3>
              <div className="grid grid-cols-1 gap-6">
                {pendingJobs.map((booking) => (
                  <GlassCard key={booking._id} hover={false} className="p-0 !bg-white/80 border border-white/60 overflow-hidden shadow-xs relative">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-accent-main" />

                    <div className="p-6 bg-blue-50/40 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-gray-100 relative">
                      <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                          <img
                            src={getImageUrl(booking.customer?.avatar, DEFAULT_AVATAR(booking.customer?.name || 'C'))} onError={(e) => handleImageError(e, DEFAULT_AVATAR(booking.customer?.name || 'C'))}
                            alt={booking.customer?.name}
                            className="w-16 h-16 rounded-2xl object-cover border-2 border-accent-main shadow-xs"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                             <h4 className="font-sora font-black text-xl text-text-primary uppercase tracking-tight truncate">
                              {booking.customer?.name}
                            </h4>
                            <Badge variant="gold" size="xs" className="!rounded-lg px-2 py-0.5 font-black text-[9px] uppercase">
                              {booking.bookingType === 'large' ? <><Maximize2 className="w-2.5 h-2.5 inline-block mr-1" /> Large</> : <><LayoutGrid className="w-2.5 h-2.5 inline-block mr-1" /> Small</>}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            {booking.bookingType === 'large' ? (
                              <>
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-accent-main bg-white px-3 py-1 rounded-lg border border-gray-200 uppercase tracking-wider">
                                  <Calendar className="w-3.5 h-3.5" /> {new Date(booking.scheduledDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-text-secondary bg-white px-3 py-1 rounded-lg border border-gray-200 uppercase tracking-wider">
                                  <Clock className="w-3.5 h-3.5" /> {booking.workingHours}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-accent-main bg-white px-3 py-1 rounded-lg border border-gray-200 uppercase tracking-wider">
                                  <Calendar className="w-3.5 h-3.5" /> {new Date(booking.scheduledDate).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-text-secondary bg-white px-3 py-1 rounded-lg border border-gray-200 uppercase tracking-wider">
                                  <Clock className="w-3.5 h-3.5" /> {booking.scheduledTime}
                                </span>
                              </>
                            )}
                            {booking.customer?.phone && (
                              <a href={`tel:${booking.customer.phone}`} className="flex items-center gap-1.5 text-[10px] font-bold text-accent-main bg-white px-3 py-1 rounded-lg border border-gray-200 uppercase tracking-wider hover:bg-blue-50 transition-all">
                                <Phone className="w-3.5 h-3.5" /> {booking.customer.phone}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={() => handleUpdateStatus(booking._id, 'cancelled')}
                          className="flex-1 lg:flex-none px-6 py-3 rounded-xl border border-red-200 bg-red-50 text-red-600 font-bold text-[10px] uppercase tracking-wider hover:bg-red-100 transition-all cursor-pointer"
                        >
                          Reject
                        </button>
                        <PremiumButton variant="gold" size="lg" className="flex-1 lg:flex-none px-8 font-black uppercase tracking-wider" onClick={() => handleUpdateStatus(booking._id, 'accepted')}>
                          Accept Job
                        </PremiumButton>
                      </div>
                    </div>

                    <div className="p-6 space-y-6 relative z-10">
                       <div className="flex items-start gap-3 p-4 bg-orange-50/50 rounded-2xl border border-orange-100/60">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-orange-100/80 shadow-xs shrink-0">
                            <MapPin className="w-5 h-5 text-accent-main" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[9px] font-black text-accent-main uppercase tracking-wider mb-1">Job Location</p>
                            <p className="text-sm font-bold text-text-primary leading-relaxed">
                              {booking.address?.street}, {booking.address?.city}, {booking.address?.state} , PIN: {booking.address?.zip}
                            </p>
                          </div>
                       </div>

                       <div>
                         <p className="text-[10px] font-black text-text-muted uppercase tracking-wider mb-2 flex items-center gap-2 px-1">
                           <MessageSquare className="w-3.5 h-3.5 text-accent-main" /> JOB DETAILS
                         </p>
                         <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                            <p className="text-xs text-text-secondary leading-relaxed font-semibold italic">
                               "{booking.description || 'No specific details provided.'}"
                            </p>
                         </div>
                       </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* Past Jobs Section */}
          <div className="space-y-6">
            <h3 className="font-sora font-black text-xl text-text-primary uppercase tracking-tight px-1">Booking History</h3>
            {otherJobs.length > 0 ? (
               <div className="space-y-4">
                  {otherJobs.map((booking) => (
                    <GlassCard key={booking._id} hover={false} className="p-6 !bg-white/80 border border-white/60 shadow-xs relative overflow-hidden">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-4 min-w-0">
                          <img
                            src={getImageUrl(booking.customer?.avatar, DEFAULT_AVATAR(booking.customer?.name || 'C'))} onError={(e) => handleImageError(e, DEFAULT_AVATAR(booking.customer?.name || 'C'))}
                            alt={booking.customer?.name}
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-accent-main shadow-xs shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                               <h4 className="font-sora font-black text-lg text-text-primary uppercase tracking-tight truncate">{booking.customer?.name}</h4>
                               <Badge variant="gold" size="xs" className="!rounded-lg px-2 py-0.5 font-black text-[8px] uppercase">
                                 {booking.bookingType === 'large' ? 'Large Work' : 'Small Work'}
                               </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 mt-2">
                               <p className="text-[10px] font-bold text-text-muted flex items-center gap-1.5 uppercase tracking-wider">
                                  <Calendar className="w-3.5 h-3.5 text-accent-main" /> {new Date(booking.scheduledDate).toLocaleDateString()} {booking.bookingType === 'large' && `- ${new Date(booking.endDate).toLocaleDateString()}`}
                               </p>
                               <p className="text-[10px] font-bold text-accent-main flex items-center gap-1.5 uppercase tracking-wider">
                                  <Clock className="w-3.5 h-3.5" /> {booking.bookingType === 'large' ? booking.workingHours : booking.scheduledTime}
                                </p>
                               <p className="text-[10px] font-bold text-text-muted flex items-center gap-1.5 uppercase tracking-wider">
                                  <MapPin className="w-3.5 h-3.5 text-accent-main" /> {booking.address?.city}
                               </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end lg:self-center">
                           <Badge
                            variant={booking.status === 'completed' ? 'success' : booking.status === 'cancelled' ? 'danger' : 'blue'}
                            className="!rounded-xl px-4 py-1.5 font-bold"
                           >
                              {booking.status}
                           </Badge>

                           <PremiumButton variant="outline" size="sm" icon={MessageSquare} onClick={() => navigate(`/worker/messages?customer=${booking.customer?._id}`)} className="px-5 !rounded-xl">Chat</PremiumButton>

                           {booking.status === 'accepted' && (
                             <PremiumButton variant="gold" size="sm" icon={CheckCircle} onClick={() => handleUpdateStatus(booking._id, 'completed')} className="px-6 !rounded-xl">Complete</PremiumButton>
                           )}

                           {(booking.status === 'completed' || booking.status === 'cancelled') && (
                             <button onClick={() => handleDeleteBooking(booking._id)} className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all shadow-xs" title="Delete record"><Trash2 className="w-4 h-4" /></button>
                           )}
                        </div>
                      </div>
                    </GlassCard>
                  ))}
               </div>
            ) : (
               <div className="text-center py-20 bg-white/60 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                     <AlertCircle className="w-7 h-7 text-accent-main" />
                  </div>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider">NO BOOKINGS YET</p>
               </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default WorkerBookings;

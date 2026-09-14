import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import Badge from '../../components/common/Badge';
import PremiumButton from '../../components/common/PremiumButton';
import { useNotification } from '../../context/NotificationContext';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, ChevronRight, MessageSquare, Trash2, AlertCircle, Phone, User, Maximize2, LayoutGrid } from 'lucide-react';
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
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent-bright border-t-transparent shadow-orange" />
        </div>
      ) : (
        <div className="space-y-12">
          {/* New Requests Section */}
          {pendingJobs.length > 0 && (
            <div className="space-y-6">
              <h3 className="font-sora font-black text-2xl text-white flex items-center gap-4 tracking-tight">
                <AlertCircle className="w-8 h-8 text-accent-bright animate-pulse" /> NEW REQUESTS
              </h3>
              <div className="grid grid-cols-1 gap-8">
                {pendingJobs.map((booking) => (
                  <GlassCard key={booking._id} hover={false} className="p-0 !bg-background-card border-2 border-accent-main/30 overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.7)] relative">
                    <div className="absolute top-0 left-0 w-2 h-full bg-accent-bright" />

                    <div className="p-8 bg-background-widget/40 flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-white/5 relative">
                      <div className="flex items-center gap-6">
                        <div className="relative shrink-0">
                          <img
                            src={booking.customer?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.customer?.name || 'C')}&background=F4510B&color=fff`}
                            alt={booking.customer?.name}
                            className="w-20 h-20 rounded-3xl object-cover border-2 border-accent-main shadow-2xl"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                             <h4 className="font-sora font-black text-2xl text-white uppercase tracking-tighter truncate">
                              {booking.customer?.name}
                            </h4>
                            <Badge variant="gold" size="xs" className="!rounded-lg px-2 py-0.5 font-black text-[9px] uppercase">
                              {booking.bookingType === 'large' ? <><Maximize2 className="w-3 h-3 inline-block mr-1" /> Large</> : <><LayoutGrid className="w-3 h-3 inline-block mr-1" /> Small</>}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 mt-3">
                            {booking.bookingType === 'large' ? (
                              <>
                                <span className="flex items-center gap-2 text-[10px] font-black text-accent-bright bg-background-dark/50 px-4 py-2 rounded-xl border border-white/5 uppercase tracking-widest">
                                  <Calendar className="w-4 h-4" /> {new Date(booking.scheduledDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-2 text-[10px] font-black text-accent-light bg-background-dark/50 px-4 py-2 rounded-xl border border-white/5 uppercase tracking-widest">
                                  <Clock className="w-4 h-4" /> {booking.workingHours}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="flex items-center gap-2 text-[10px] font-black text-accent-bright bg-background-dark/50 px-4 py-2 rounded-xl border border-white/5 uppercase tracking-widest">
                                  <Calendar className="w-4 h-4" /> {new Date(booking.scheduledDate).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-2 text-[10px] font-black text-accent-light bg-background-dark/50 px-4 py-2 rounded-xl border border-white/5 uppercase tracking-widest">
                                  <Clock className="w-4 h-4" /> {booking.scheduledTime}
                                </span>
                              </>
                            )}
                            {booking.customer?.phone && (
                              <a href={`tel:${booking.customer.phone}`} className="flex items-center gap-2 text-[10px] font-black text-accent-peach bg-background-dark/50 px-4 py-2 rounded-xl border border-white/5 uppercase tracking-widest hover:bg-accent-orange/20 transition-all">
                                <Phone className="w-4 h-4" /> {booking.customer.phone}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <button
                          onClick={() => handleUpdateStatus(booking._id, 'cancelled')}
                          className="flex-1 lg:flex-none px-8 py-4 rounded-2xl border-2 border-red-500/30 text-red-400 font-black text-[11px] uppercase tracking-widest hover:bg-red-500/10 transition-all"
                        >
                          Reject
                        </button>
                        <PremiumButton variant="gold" size="lg" className="flex-1 lg:flex-none px-12 shadow-orange font-black uppercase tracking-widest" onClick={() => handleUpdateStatus(booking._id, 'accepted')}>
                          Accept Job
                        </PremiumButton>
                      </div>
                    </div>

                    <div className="p-8 space-y-8 relative z-10">
                       <div className="flex items-start gap-4 p-6 bg-background-widget/20 rounded-[2rem] border border-white/5">
                          <div className="w-12 h-12 rounded-2xl bg-background-dark flex items-center justify-center border border-accent-bright/20 shadow-xl shrink-0">
                            <MapPin className="w-6 h-6 text-accent-bright" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-black text-accent-light uppercase tracking-[0.3em] mb-2">Job Location</p>
                            <p className="text-base font-bold text-white leading-relaxed">
                              {booking.address?.street}, {booking.address?.city}, {booking.address?.state} , PIN: {booking.address?.zip}
                            </p>
                          </div>
                       </div>

                       <div>
                         <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-4 flex items-center gap-3 px-2">
                           <MessageSquare className="w-4 h-4 text-accent-main" /> JOB DETAILS
                         </p>
                         <div className="bg-background-dark/30 p-7 rounded-[2.5rem] border-2 border-white/5 shadow-inner relative group min-h-[120px] hover:border-accent-main/20 transition-all">
                            <p className="text-sm sm:text-base text-text-secondary leading-relaxed font-bold italic opacity-90 pr-12">
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
          <div className="space-y-8">
            <h3 className="font-sora font-black text-2xl text-white uppercase tracking-tight px-2">Booking History</h3>
            {otherJobs.length > 0 ? (
               <div className="space-y-5">
                  {otherJobs.map((booking) => (
                    <GlassCard key={booking._id} hover={false} className="p-6 sm:p-8 !bg-background-card border-border-primary/40 shadow-2xl relative overflow-hidden group">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-accent-orange/5 blur-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                        <div className="flex items-center gap-6 min-w-0">
                          <img
                            src={booking.customer?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.customer?.name || 'C')}&background=F4510B&color=fff`}
                            alt={booking.customer?.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] object-cover border-2 border-accent-main shadow-2xl shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                               <h4 className="font-sora font-black text-xl text-white uppercase tracking-tighter truncate">{booking.customer?.name}</h4>
                               <Badge variant="gold" size="xs" className="!rounded-lg px-2 py-0.5 font-black text-[8px] uppercase">
                                 {booking.bookingType === 'large' ? 'Large Work' : 'Small Work'}
                               </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-5 mt-3">
                               <p className="text-[10px] font-black text-text-muted flex items-center gap-2 uppercase tracking-widest">
                                  <Calendar className="w-4 h-4 text-accent-bright" /> {new Date(booking.scheduledDate).toLocaleDateString()} {booking.bookingType === 'large' && `- ${new Date(booking.endDate).toLocaleDateString()}`}
                               </p>
                               <p className="text-[10px] font-black text-accent-light flex items-center gap-2 uppercase tracking-widest">
                                  <Clock className="w-4 h-4" /> {booking.bookingType === 'large' ? booking.workingHours : booking.scheduledTime}
                                </p>
                               <p className="text-[10px] font-black text-accent-light flex items-center gap-2 uppercase tracking-widest">
                                  <MapPin className="w-4 h-4" /> {booking.address?.city}
                               </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0 self-end lg:self-center">
                           <Badge
                            variant={booking.status === 'completed' ? 'success' : booking.status === 'cancelled' ? 'danger' : 'blue'}
                            className="!rounded-xl px-5 py-2 font-black"
                           >
                              {booking.status}
                           </Badge>

                           <PremiumButton variant="outline" size="sm" icon={MessageSquare} onClick={() => navigate(`/worker/messages?customer=${booking.customer?._id}`)} className="px-6 !rounded-xl">Chat</PremiumButton>

                           {booking.status === 'accepted' && (
                             <PremiumButton variant="gold" size="sm" icon={CheckCircle} onClick={() => handleUpdateStatus(booking._id, 'completed')} className="px-8 !rounded-xl shadow-orange">Complete</PremiumButton>
                           )}

                           {(booking.status === 'completed' || booking.status === 'cancelled') && (
                             <button onClick={() => handleDeleteBooking(booking._id)} className="p-3.5 rounded-2xl bg-red-950/20 text-red-400 border border-red-500/20 hover:bg-red-900/30 transition-all shadow-xl" title="Delete record"><Trash2 className="w-5 h-5" /></button>
                           )}
                        </div>
                      </div>
                    </GlassCard>
                  ))}
               </div>
            ) : (
               <div className="text-center py-24 bg-background-cardSecondary/40 rounded-[3rem] border-2 border-dashed border-border-primary/20">
                  <div className="w-16 h-16 bg-background-dark rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl opacity-20">
                     <AlertCircle className="w-8 h-8 text-text-muted" />
                  </div>
                  <p className="text-xs font-black text-text-muted uppercase tracking-[0.3em]">NO BOOKINGS YET</p>
               </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default WorkerBookings;

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import Badge from '../../components/common/Badge';
import PremiumButton from '../../components/common/PremiumButton';
import { useNotification } from '../../context/NotificationContext';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, ChevronRight, MessageSquare, Trash2, AlertCircle, Phone, User } from 'lucide-react';
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
      const input = prompt('Enter final job cost in ₹:');
      if (input === null) return; // cancel
      finalCost = parseInt(input || '0');
    }

    try {
      const res = await API.put(`/bookings/${bookingId}/status`, {
        status: newStatus,
        finalCost,
      });

      if (res.success) {
        showToast('Booking Updated', `Booking is now marked as ${newStatus}.`, 'success');
        fetchBookings();
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
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

  // Group bookings
  const pendingJobs = bookings.filter(b => b.status === 'pending');
  const otherJobs = bookings.filter(b => b.status !== 'pending');

  return (
    <DashboardLayout
      title="My Service Jobs"
      subtitle="Accept new requests and manage your ongoing work assignments"
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-gold border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-10">
          {/* New Requests Section */}
          {pendingJobs.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-sora font-bold text-lg text-text-primary flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-accent-gold animate-bounce" /> New Booking Requests
              </h3>
              <div className="grid grid-cols-1 gap-6">
                {pendingJobs.map((booking) => (
                  <GlassCard key={booking._id} hover={false} className="p-0 border-2 border-accent-gold/20 overflow-hidden shadow-xl">
                    {/* Header: Customer Info & Actions */}
                    <div className="p-6 bg-gradient-to-r from-amber-50/50 to-white flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100">
                      <div className="flex items-center gap-5">
                        <div className="relative">
                          <img
                            src={booking.customer?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.customer?.name || 'C')}&background=D4AF37&color=fff`}
                            alt={booking.customer?.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-accent-gold shadow-md"
                          />
                          <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent-gold rounded-full flex items-center justify-center text-[10px] text-white font-bold border-2 border-white">!</span>
                        </div>
                        <div>
                          <h4 className="font-sora font-extrabold text-lg text-text-primary uppercase tracking-tight flex items-center gap-2">
                            {booking.customer?.name}
                          </h4>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs font-bold">
                            <span className="flex items-center gap-1.5 text-accent-gold bg-amber-50 px-3 py-1 rounded-full border border-accent-gold/10">
                              <Calendar className="w-3.5 h-3.5" /> {new Date(booking.scheduledDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1.5 text-accent-blue bg-blue-50 px-3 py-1 rounded-full border border-accent-blue/10">
                              <Clock className="w-3.5 h-3.5" /> {booking.scheduledTime}
                            </span>
                            {booking.customer?.phone && (
                              <a href={`tel:${booking.customer.phone}`} className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-600/10 hover:bg-emerald-100 transition-colors">
                                <Phone className="w-3.5 h-3.5" /> {booking.customer.phone}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleUpdateStatus(booking._id, 'cancelled')}
                          className="px-6 py-2.5 rounded-xl border border-red-200 text-accent-red font-bold text-xs hover:bg-red-50 transition-all"
                        >
                          Reject
                        </button>
                        <PremiumButton variant="gold" size="md" className="px-10 shadow-glow font-extrabold uppercase tracking-wider" onClick={() => handleUpdateStatus(booking._id, 'accepted')}>
                          Accept Job Now
                        </PremiumButton>
                      </div>
                    </div>

                    {/* Body: Address & Reading Box Description */}
                    <div className="p-6 space-y-5">
                       {/* Customer Service Address */}
                       <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <MapPin className="w-5 h-5 text-accent-gold shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-extrabold text-accent-gold uppercase tracking-widest mb-1">Customer Service Location</p>
                            <p className="text-sm font-semibold text-text-primary leading-relaxed">
                              {booking.address?.street}, {booking.address?.city}, {booking.address?.state} - {booking.address?.zip}
                            </p>
                          </div>
                       </div>

                       {/* Reading Box Description */}
                       <div>
                         <p className="text-[10px] font-extrabold text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1.5 px-1">
                           <MessageSquare className="w-3 h-3" /> Job Requirements & Description
                         </p>
                         <div className="bg-white p-5 rounded-2xl border-2 border-gray-100 shadow-inner relative group min-h-[100px]">
                            <div className="absolute top-4 right-4 text-accent-gold/20 group-hover:text-accent-gold/40 transition-colors">
                               <ChevronRight className="w-8 h-8" />
                            </div>
                            <p className="text-sm text-text-secondary leading-relaxed font-medium whitespace-pre-wrap pr-10">
                               {booking.description || 'No specific description provided by the customer.'}
                            </p>
                         </div>
                       </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* Active & History Section */}
          <div className="space-y-4">
            <h3 className="font-sora font-bold text-lg text-text-primary">Ongoing & Previous Jobs</h3>
            {otherJobs.length > 0 ? (
               <div className="space-y-4">
                  {otherJobs.map((booking) => (
                    <GlassCard key={booking._id} hover={false} className="p-5 border border-gray-100">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <img
                            src={booking.customer?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.customer?.name || 'C')}&background=D4AF37&color=fff`}
                            alt={booking.customer?.name}
                            className="w-12 h-12 rounded-full object-cover border border-gray-200"
                          />
                          <div>
                            <h4 className="font-sora font-semibold text-sm text-text-primary">{booking.customer?.name}</h4>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5">
                               <p className="text-[10px] text-text-muted flex items-center gap-1">
                                  <Calendar className="w-3 h-3" /> {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}
                               </p>
                               <p className="text-[10px] text-accent-gold flex items-center gap-1 font-medium">
                                  <MapPin className="w-3 h-3" /> {booking.address?.street}, {booking.address?.city}
                               </p>
                               {booking.customer?.phone && (
                                 <p className="text-[10px] text-emerald-600 flex items-center gap-1 font-bold">
                                   <Phone className="w-3 h-3" /> {booking.customer.phone}
                                 </p>
                               )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                           <Badge variant={booking.status === 'completed' ? 'success' : booking.status === 'cancelled' ? 'danger' : 'blue'}>
                              {booking.status.toUpperCase()}
                           </Badge>

                           <PremiumButton variant="outline" size="sm" icon={MessageSquare} onClick={() => navigate(`/worker/messages?customer=${booking.customer?._id}`)}>Chat</PremiumButton>

                           {booking.status === 'accepted' && (
                             <PremiumButton variant="ai" size="sm" icon={CheckCircle} onClick={() => handleUpdateStatus(booking._id, 'completed')}>Complete</PremiumButton>
                           )}

                           {(booking.status === 'completed' || booking.status === 'cancelled') && (
                             <button onClick={() => handleDeleteBooking(booking._id)} className="p-2 rounded-xl bg-red-50 text-accent-red hover:bg-red-100" title="Delete History"><Trash2 className="w-4 h-4" /></button>
                           )}
                        </div>
                      </div>
                    </GlassCard>
                  ))}
               </div>
            ) : (
               <div className="text-center py-10 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  <p className="text-xs text-text-muted">No ongoing or past jobs to display.</p>
               </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default WorkerBookings;

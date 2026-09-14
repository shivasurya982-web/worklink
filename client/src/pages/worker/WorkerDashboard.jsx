import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Star, Power, CheckCircle, Eye, AlertTriangle, Briefcase, Bell, Trash2, ArrowRight, Sparkles, TrendingUp, Users, MessageSquare, User, DollarSign } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import PremiumButton from '../../components/common/PremiumButton';
import Badge from '../../components/common/Badge';
import RatingStars from '../../components/common/RatingStars';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import API from '../../services/api';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [stats, setStats] = useState({});
  const [recentReviews, setRecentReviews] = useState([]);
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable ?? true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get('/workers/dashboard');
        if (res.success) {
          setStats(res.data.stats || {});
          setRecentReviews(res.data.recentReviews || []);
          if (res.data.worker) {
            setIsAvailable(res.data.worker.isAvailable);
          }
        }
      } catch (err) {
        console.error('Error fetching worker dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleToggleAvailability = async () => {
    try {
      const res = await API.put('/workers/availability');
      if (res.success) {
        setIsAvailable(res.data.isAvailable);
        showToast(
          'Status Changed',
          `You are now ${res.data.isAvailable ? 'showing' : 'hidden'} to customers.`,
          'info'
        );
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const dashboardItems = [
    { label: 'Today\'s Jobs', val: stats.todaysBookings || 0, icon: Calendar, color: 'text-accent-bright' },
    { label: 'Pending Jobs', val: stats.pendingRequests || 0, icon: Clock, color: 'text-accent-peach' },
    { label: 'Unread Alerts', val: stats.unreadNotifications || 0, icon: Bell, color: 'text-accent-bright' },
    { label: 'Jobs Done', val: stats.completedJobs || 0, icon: CheckCircle, color: 'text-accent-green' },
    { label: 'Total Earnings', val: `₹${stats.totalEarnings || 0}`, icon: DollarSign, color: 'text-accent-bright' },
    { label: 'Total Jobs', val: stats.totalJobs || 0, icon: Briefcase, color: 'text-white' },
  ];

  return (
    <DashboardLayout
      title={`Hi, ${user?.name}!`}
      subtitle="Here is what is happening with your work"
    >
      {/* Availability Status Header Card */}
      <GlassCard goldBorder className="!bg-background-dark/80 p-8 rounded-[2.5rem] mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 border border-accent-main/40 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent-orange/5 blur-3xl pointer-events-none" />

        <div className="flex items-center gap-8 relative z-10">
          <div className="relative shrink-0">
            <div
              className={`w-8 h-8 rounded-2xl animate-pulse ${isAvailable ? 'bg-accent-green shadow-[0_0_25px_rgba(34,197,94,0.6)]' : 'bg-background-cardSecondary shadow-xl'
                }`}
            />
            {isAvailable && <div className="absolute inset-0 bg-accent-green rounded-2xl animate-ping opacity-25" />}
          </div>
          <div>
            <h3 className="font-sora font-black text-2xl text-white uppercase tracking-tighter">
              MY STATUS: {isAvailable ? 'READY TO WORK' : 'NOT WORKING'}
            </h3>
            <p className="text-[11px] text-text-muted font-bold mt-2 uppercase tracking-[0.2em] opacity-80 leading-relaxed max-w-2xl">
              {isAvailable
                ? 'You are now visible to customers. New job requests will appear in your alerts.'
                : 'You are now hidden from customers. You can still see your current jobs.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleAvailability}
          className={`px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-95 relative z-10 shrink-0 ${isAvailable
              ? 'bg-red-950/40 text-red-400 border-2 border-red-500/40 hover:bg-red-900/40'
              : 'bg-emerald-950/40 text-emerald-400 border-2 border-emerald-500/40 hover:bg-emerald-900/40'
            }`}
        >
          <Power className="w-5 h-5 inline-block mr-3" />
          {isAvailable ? 'Go Offline' : 'Go Online'}
        </button>
      </GlassCard>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-12">
        {dashboardItems.map((item, i) => (
          <GlassCard key={i} className="flex flex-col items-center text-center gap-5 p-8 !bg-background-card border-border-primary/40 shadow-2xl group hover:-translate-y-1 transition-all">
             <div className={`w-14 h-14 rounded-2xl bg-background-widget flex items-center justify-center border border-white/5 shadow-xl group-hover:bg-accent-orange transition-all duration-500`}>
                <item.icon className={`w-7 h-7 ${item.color} group-hover:text-white transition-colors`} />
             </div>
             <div>
                <div className="text-3xl font-sora font-black text-white tracking-tighter mb-1">
                  {loading ? '...' : item.val}
                </div>
                <div className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">{item.label}</div>
             </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Recent Reviews Section */}
        <GlassCard className="lg:col-span-2 p-8 sm:p-10 !bg-background-card border-border-primary/40 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
            <h3 className="font-sora font-black text-xl text-white uppercase tracking-widest flex items-center gap-4">
              <Star className="w-7 h-7 text-accent-bright fill-accent-bright" /> REVIEWS
            </h3>
          </div>

          <div className="space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            {recentReviews.length > 0 ? (
              recentReviews.map((review) => (
                <div key={review._id} className="p-5 rounded-2xl bg-background-dark/50 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={review.customer?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.customer?.name || 'C')}&background=F4510B&color=fff`}
                        alt={review.customer?.name}
                        className="w-10 h-10 rounded-xl object-cover border-2 border-accent-main shadow-lg"
                      />
                      <div>
                        <p className="text-xs font-black text-white uppercase">{review.customer?.name}</p>
                        <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <RatingStars rating={review.rating} size="xs" />
                  </div>
                  <p className="text-xs text-text-secondary italic font-medium leading-relaxed">"{review.comment}"</p>
                  {review.workerReply ? (
                     <div className="mt-2 pl-4 border-l-2 border-accent-orange">
                        <p className="text-[9px] font-black text-accent-bright uppercase tracking-widest mb-1">Your Response:</p>
                        <p className="text-[10px] text-text-muted italic">"{review.workerReply}"</p>
                     </div>
                  ) : (
                    <button onClick={() => navigate('/worker/profile')} className="text-[9px] font-black text-accent-light hover:text-white uppercase tracking-widest flex items-center gap-1.5 transition-colors">
                       <MessageSquare className="w-3 h-3" /> Reply to improve your score
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-background-dark/30 rounded-3xl border-2 border-dashed border-white/5 opacity-40">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">No reviews received yet</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Action Board */}
        <GlassCard className="p-8 sm:p-10 !bg-background-card border-border-primary/40 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-accent-orange/5 blur-3xl pointer-events-none" />
           <h3 className="font-sora font-black text-xl text-white uppercase tracking-widest mb-8 border-b border-white/5 pb-6">Quick Actions</h3>
           <div className="space-y-4">
              <PremiumButton variant="gold" fullWidth onClick={() => navigate('/worker/available-jobs')} icon={Sparkles} className="py-4 !rounded-xl text-[10px] font-black uppercase tracking-widest">Find New Jobs</PremiumButton>
              <PremiumButton variant="outline" fullWidth onClick={() => navigate('/worker/profile')} icon={User} className="py-4 !rounded-xl text-[10px] font-black uppercase tracking-widest border-2">Edit My Bio</PremiumButton>
              <PremiumButton variant="outline" fullWidth onClick={() => navigate('/worker/portfolio')} icon={Briefcase} className="py-4 !rounded-xl text-[10px] font-black uppercase tracking-widest border-2">Manage Photos</PremiumButton>
           </div>
        </GlassCard>
      </div>

      {/* Nearby Jobs Board */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-8 px-2">
           <h3 className="font-sora font-black text-2xl text-white flex items-center gap-4 tracking-tight uppercase">
             <Sparkles className="w-8 h-8 text-accent-bright" /> Job Requests Nearby
           </h3>
           <Link to="/worker/available-jobs" className="text-[10px] font-black text-accent-bright hover:text-white transition-all flex items-center gap-3 uppercase tracking-[0.4em]">
             SEE ALL REQUESTS <ArrowRight className="w-5 h-5" />
           </Link>
        </div>

        <GlassCard className="p-12 text-center !bg-background-cardSecondary border-dashed border-2 border-border-primary/40 shadow-[0_30px_80px_rgba(0,0,0,0.7)] rounded-[4rem] relative overflow-hidden group hover:border-accent-orange transition-all duration-500">
           <div className="absolute inset-0 bg-accent-orange/5 opacity-0 group-hover:opacity-100 transition-opacity blur-[80px]" />
           <div className="w-20 h-20 bg-background-dark rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/5 group-hover:scale-110 transition-transform duration-500 relative z-10">
              <Users className="w-10 h-10 text-accent-bright" />
           </div>
           <h4 className="font-sora font-black text-3xl text-white mb-4 relative z-10 uppercase tracking-tighter">Get More Jobs</h4>
           <p className="text-sm text-text-muted mb-12 max-w-lg mx-auto font-bold leading-relaxed opacity-80 relative z-10 uppercase tracking-widest">Customers are looking for help right now. Check the latest requests and pick a job today.</p>
           <PremiumButton variant="gold" size="lg" onClick={() => navigate('/worker/available-jobs')} className="px-16 py-5 relative z-10 shadow-orange">
              START LOOKING
           </PremiumButton>
        </GlassCard>
      </div>

    </DashboardLayout>
  );
};

export default WorkerDashboard;

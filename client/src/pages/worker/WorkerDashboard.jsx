import { getImageUrl, handleImageError, DEFAULT_AVATAR } from '../../utils/imageUtils';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Star, Power, CheckCircle, Briefcase, Bell, ArrowRight, Sparkles, Users, MessageSquare, User, DollarSign } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import PremiumButton from '../../components/common/PremiumButton';
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
    { label: 'Today\'s Jobs', val: stats.todaysBookings || 0, icon: Calendar, color: 'text-accent-main' },
    { label: 'Pending Jobs', val: stats.pendingRequests || 0, icon: Clock, color: 'text-accent-main' },
    { label: 'Unread Alerts', val: stats.unreadNotifications || 0, icon: Bell, color: 'text-accent-main' },
    { label: 'Jobs Done', val: stats.completedJobs || 0, icon: CheckCircle, color: 'text-emerald-600' },
    { label: 'Total Earnings', val: `₹${stats.totalEarnings || 0}`, icon: DollarSign, color: 'text-accent-main' },
    { label: 'Total Jobs', val: stats.totalJobs || 0, icon: Briefcase, color: 'text-text-primary' },
  ];

  return (
    <DashboardLayout
      title={`Hi, ${user?.name}!`}
      subtitle="Here is what is happening with your work"
    >
      {/* Availability Status Header Card */}
      <GlassCard goldBorder className="!bg-white/80 p-6 sm:p-8 rounded-[2rem] mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border border-white/60 shadow-xs relative overflow-hidden">
        <div className="flex items-center gap-6 relative z-10">
          <div className="relative shrink-0">
            <div
              className={`w-6 h-6 rounded-xl animate-pulse ${isAvailable ? 'bg-emerald-500 shadow-xs' : 'bg-gray-300'
                }`}
            />
          </div>
          <div>
            <h3 className="font-sora font-black text-xl text-text-primary uppercase tracking-tight">
              MY STATUS: {isAvailable ? 'READY TO WORK' : 'NOT WORKING'}
            </h3>
            <p className="text-[11px] text-text-secondary font-bold mt-1 uppercase tracking-wider leading-relaxed max-w-2xl">
              {isAvailable
                ? 'You are now visible to customers. New job requests will appear in your alerts.'
                : 'You are now hidden from customers. You can still see your current jobs.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleAvailability}
          className={`px-8 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all shadow-xs active:scale-95 relative z-10 shrink-0 cursor-pointer ${isAvailable
              ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
            }`}
        >
          <Power className="w-4 h-4 inline-block mr-2" />
          {isAvailable ? 'Go Offline' : 'Go Online'}
        </button>
      </GlassCard>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-10">
        {dashboardItems.map((item, i) => (
          <GlassCard key={i} className="flex flex-col items-center text-center gap-4 p-6 !bg-white/70 border border-white/60 shadow-xs group hover:-translate-y-0.5 transition-all">
             <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 group-hover:bg-accent-main transition-all">
                <item.icon className={`w-6 h-6 ${item.color} group-hover:text-white transition-colors`} />
             </div>
             <div>
                <div className="text-2xl font-sora font-black text-text-primary tracking-tight mb-0.5">
                  {loading ? '...' : item.val}
                </div>
                <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider">{item.label}</div>
             </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Recent Reviews Section */}
        <GlassCard className="lg:col-span-2 p-6 sm:p-8 !bg-white/80 border border-white/60 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
            <h3 className="font-sora font-black text-lg text-text-primary uppercase tracking-wider flex items-center gap-3">
              <Star className="w-6 h-6 text-amber-500 fill-amber-500" /> REVIEWS
            </h3>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
            {recentReviews.length > 0 ? (
              recentReviews.map((review) => (
                <div key={review._id} className="p-4 rounded-xl bg-blue-50/50 border border-blue-100/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={getImageUrl(review.customer?.avatar, DEFAULT_AVATAR(review.customer?.name || 'C'))} onError={(e) => handleImageError(e, DEFAULT_AVATAR(review.customer?.name || 'C'))}
                        alt={review.customer?.name}
                        className="w-9 h-9 rounded-xl object-cover border border-accent-main shadow-xs"
                      />
                      <div>
                        <p className="text-xs font-black text-text-primary uppercase">{review.customer?.name}</p>
                        <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <RatingStars rating={review.rating} size="xs" />
                  </div>
                  <p className="text-xs text-text-secondary italic font-semibold leading-relaxed">"{review.comment}"</p>
                  {review.workerReply ? (
                     <div className="mt-2 pl-3 border-l-2 border-accent-main">
                        <p className="text-[9px] font-black text-accent-main uppercase tracking-wider mb-0.5">Your Response:</p>
                        <p className="text-[10px] text-text-muted italic">"{review.workerReply}"</p>
                     </div>
                  ) : (
                    <button onClick={() => navigate('/worker/profile')} className="text-[9px] font-black text-accent-main hover:underline uppercase tracking-wider flex items-center gap-1 transition-colors">
                       <MessageSquare className="w-3 h-3" /> Reply to improve your score
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-white/60 rounded-2xl border-2 border-dashed border-gray-200 opacity-60">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">No reviews received yet</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Action Board */}
        <GlassCard className="p-6 sm:p-8 !bg-white/80 border border-white/60 shadow-xs relative overflow-hidden">
           <h3 className="font-sora font-black text-lg text-text-primary uppercase tracking-wider mb-6 border-b border-gray-100 pb-4">Quick Actions</h3>
           <div className="space-y-3">
              <PremiumButton variant="gold" fullWidth onClick={() => navigate('/worker/available-jobs')} icon={Sparkles} className="py-3.5 text-[10px] font-black uppercase tracking-wider">Find New Jobs</PremiumButton>
              <PremiumButton variant="outline" fullWidth onClick={() => navigate('/worker/profile')} icon={User} className="py-3.5 text-[10px] font-black uppercase tracking-wider">Edit My Bio</PremiumButton>
              <PremiumButton variant="outline" fullWidth onClick={() => navigate('/worker/portfolio')} icon={Briefcase} className="py-3.5 text-[10px] font-black uppercase tracking-wider">Manage Photos</PremiumButton>
           </div>
        </GlassCard>
      </div>

      {/* Nearby Jobs Board */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6 px-1">
           <h3 className="font-sora font-black text-xl text-text-primary flex items-center gap-3 tracking-tight uppercase">
             <Sparkles className="w-6 h-6 text-accent-main" /> Job Requests Nearby
           </h3>
           <Link to="/worker/available-jobs" className="text-[10px] font-bold text-accent-main hover:underline flex items-center gap-2 uppercase tracking-wider">
             SEE ALL REQUESTS <ArrowRight className="w-4 h-4" />
           </Link>
        </div>

        <GlassCard className="p-10 text-center !bg-white/80 border-dashed border-2 border-gray-200 shadow-xs rounded-[3rem] relative overflow-hidden group hover:border-accent-main transition-all">
           <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-100 shadow-xs group-hover:scale-105 transition-transform duration-300">
              <Users className="w-8 h-8 text-accent-main" />
           </div>
           <h4 className="font-sora font-black text-2xl text-text-primary mb-3 uppercase tracking-tight">Get More Jobs</h4>
           <p className="text-xs text-text-secondary mb-8 max-w-md mx-auto font-bold leading-relaxed uppercase tracking-wider">Customers are looking for help right now. Check the latest requests and pick a job today.</p>
           <PremiumButton variant="gold" size="lg" onClick={() => navigate('/worker/available-jobs')} className="px-12 py-4">
              START LOOKING
           </PremiumButton>
        </GlassCard>
      </div>

    </DashboardLayout>
  );
};

export default WorkerDashboard;

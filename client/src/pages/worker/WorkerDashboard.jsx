import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Star, Power, CheckCircle, Eye, AlertTriangle, Briefcase, Bell, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import PremiumButton from '../../components/common/PremiumButton';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import API from '../../services/api';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [stats, setStats] = useState({});
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable ?? true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get('/workers/dashboard');
        if (res.success) {
          setStats(res.data.stats || {});
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
          'Operational Status',
          `System is now ${res.data.isAvailable ? 'Broadcasting' : 'Hidden'} your profile.`,
          'info'
        );
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  return (
    <DashboardLayout
      title={`Professional Hub – ${user?.name}`}
      subtitle="Operational monitoring and client coordination center"
    >
      {/* Availability Status Header Card */}
      <GlassCard goldBorder className="!bg-background-dark/80 p-8 rounded-[2.5rem] mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-accent-main/40 shadow-[0_30px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div
              className={`w-5 h-5 rounded-full animate-pulse ${isAvailable ? 'bg-accent-green shadow-[0_0_20px_#22C55E]' : 'bg-background-cardSecondary shadow-xl'
                }`}
            />
            {isAvailable && <div className="absolute inset-0 bg-accent-green rounded-full animate-ping opacity-25" />}
          </div>
          <div>
            <h3 className="font-sora font-black text-xl text-white uppercase tracking-tight">
              Service Status: {isAvailable ? 'Broadcasting Live' : 'Market Offline'}
            </h3>
            <p className="text-[11px] text-text-muted font-bold mt-1 uppercase tracking-widest opacity-80 leading-relaxed">
              {isAvailable
                ? 'Local market algorithms are prioritizing your profile for incoming service requests.'
                : 'Operational signals are suppressed. Existing contracts remain active in your terminal.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleAvailability}
          className={`px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-95 ${isAvailable
              ? 'bg-red-950/40 text-red-400 border-2 border-red-500/40 hover:bg-red-900/40'
              : 'bg-emerald-950/40 text-emerald-400 border-2 border-emerald-500/40 hover:bg-emerald-900/40'
            }`}
        >
          <Power className="w-5 h-5 inline-block mr-3" />
          {isAvailable ? 'Deactivate Node' : 'Initialize Node'}
        </button>
      </GlassCard>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-8 mb-12">
        <GlassCard className="flex items-center gap-6 p-6 md:p-8 !bg-background-card border-border-primary/40 shadow-2xl group relative overflow-hidden">
          <div className="w-16 h-16 rounded-[1.5rem] bg-background-widget text-accent-bright flex items-center justify-center shrink-0 border border-white/5 shadow-2xl group-hover:bg-accent-orange group-hover:text-white transition-all duration-500">
            <Calendar className="w-8 h-8" />
          </div>
          <div className="min-w-0">
            <div className="text-3xl md:text-4xl font-sora font-black text-white tracking-tighter">
              {stats.todaysBookings || 0}
            </div>
            <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mt-1">Daily Load</div>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-6 p-6 md:p-8 !bg-background-card border-border-primary/40 shadow-2xl group relative overflow-hidden">
          <div className="w-16 h-16 rounded-[1.5rem] bg-background-widget text-accent-peach flex items-center justify-center shrink-0 border border-white/5 shadow-2xl group-hover:bg-accent-orange group-hover:text-white transition-all duration-500">
            <Clock className="w-8 h-8" />
          </div>
          <div className="min-w-0">
            <div className="text-3xl md:text-4xl font-sora font-black text-white tracking-tighter">
              {stats.pendingRequests || 0}
            </div>
            <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mt-1">Pending</div>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-6 p-6 md:p-8 !bg-background-card border-border-primary/40 shadow-2xl group relative overflow-hidden">
          <div className="w-16 h-16 rounded-[1.5rem] bg-background-widget text-accent-bright flex items-center justify-center shrink-0 border border-white/5 shadow-2xl group-hover:bg-accent-orange group-hover:text-white transition-all duration-500">
            <Bell className="w-8 h-8" />
          </div>
          <div className="min-w-0">
            <div className="text-3xl md:text-4xl font-sora font-black text-white tracking-tighter">
              {stats.unreadNotifications || 0}
            </div>
            <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mt-1">Signals</div>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-6 p-6 md:p-8 !bg-background-card border-border-primary/40 shadow-2xl group relative overflow-hidden">
          <div className="w-16 h-16 rounded-[1.5rem] bg-background-widget text-accent-green flex items-center justify-center shrink-0 border border-white/5 shadow-2xl group-hover:bg-accent-green group-hover:text-white transition-all duration-500">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div className="min-w-0">
            <div className="text-3xl md:text-4xl font-sora font-black text-white tracking-tighter">
              {stats.completedJobs || 0}
            </div>
            <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mt-1">Finalized</div>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-6 p-6 md:p-8 !bg-background-card border-border-primary/40 shadow-2xl group relative overflow-hidden">
          <div className="w-16 h-16 rounded-[1.5rem] bg-background-widget text-accent-red flex items-center justify-center shrink-0 border border-white/5 shadow-2xl group-hover:bg-red-600 group-hover:text-white transition-all duration-500">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="min-w-0">
            <div className="text-3xl md:text-4xl font-sora font-black text-white tracking-tighter">
              {stats.notCompletedJobs || 0}
            </div>
            <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mt-1">Aborted</div>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-6 p-6 md:p-8 !bg-background-card border-border-primary/40 shadow-2xl group relative overflow-hidden">
          <div className="w-16 h-16 rounded-[1.5rem] bg-background-widget text-text-primary flex items-center justify-center shrink-0 border border-white/5 shadow-2xl group-hover:bg-accent-orange group-hover:text-white transition-all duration-500">
            <Briefcase className="w-8 h-8" />
          </div>
          <div className="min-w-0">
            <div className="text-3xl md:text-4xl font-sora font-black text-white tracking-tighter">
              {stats.totalJobs || 0}
            </div>
            <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mt-1">Historical</div>
          </div>
        </GlassCard>
      </div>

      {/* Nearby Jobs Board */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-8 px-2">
           <h3 className="font-sora font-black text-2xl text-white flex items-center gap-4 tracking-tight">
             <Sparkles className="w-8 h-8 text-accent-bright" /> Available Service Signals
           </h3>
           <Link to="/worker/available-jobs" className="text-[10px] font-black text-accent-bright hover:text-white transition-all flex items-center gap-3 uppercase tracking-[0.4em]">
             SCAN ALL SIGNALS <ArrowRight className="w-5 h-5" />
           </Link>
        </div>

        <GlassCard className="p-12 text-center !bg-background-cardSecondary border-dashed border-2 border-border-primary/50 shadow-[0_30px_80px_rgba(0,0,0,0.7)] rounded-[3rem] relative overflow-hidden group hover:border-accent-orange transition-all duration-500">
           <div className="absolute inset-0 bg-accent-orange/5 opacity-0 group-hover:opacity-100 transition-opacity blur-[80px]" />
           <div className="w-20 h-20 bg-background-dark rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/5 group-hover:scale-110 transition-transform duration-500 relative z-10">
              <Briefcase className="w-10 h-10 text-accent-bright" />
           </div>
           <h4 className="font-sora font-black text-2xl text-white mb-4 relative z-10">Expand Your Local Reach</h4>
           <p className="text-sm text-text-muted mb-10 max-w-md mx-auto font-bold leading-relaxed opacity-80 relative z-10 uppercase tracking-wide">Customers are broadcasting service needs in real-time. Connect instantly to secure your next project.</p>
           <PremiumButton variant="gold" size="lg" onClick={() => navigate('/worker/available-jobs')} className="px-12 relative z-10 shadow-[0_15px_35px_rgba(244,81,11,0.5)]">
              INITIALIZE SCAN
           </PremiumButton>
        </GlassCard>
      </div>

    </DashboardLayout>
  );
};

export default WorkerDashboard;

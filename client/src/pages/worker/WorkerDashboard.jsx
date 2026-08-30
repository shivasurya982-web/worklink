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
          'Status Updated',
          `You are now ${res.data.isAvailable ? 'Available' : 'Unavailable'} for bookings`,
          'info'
        );
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  return (
    <DashboardLayout
      title={`Worker Portal– ${user?.name}`}
      subtitle="Manage your bookings, availability, earnings, and customer requests"
    >
      {/* Availability Status Header Card */}
      <GlassCard goldBorder className="bg-white p-6 rounded-3xl mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full animate-pulse ${isAvailable ? 'bg-accent-green shadow-lg shadow-accent-green/50' : 'bg-gray-400'
              }`}
          />
          <div>
            <h3 className="font-sora font-semibold text-base text-text-primary uppercase tracking-tight">
              Work Status: {isAvailable ? 'AVAILABLE NOW' : 'OFF DUTY'}
            </h3>
            <p className="text-xs text-text-muted">
              {isAvailable
                ? 'You are visible in search results and can receive instant customer bookings.'
                : 'You are hidden from new search results. Existing bookings remain active.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleAvailability}
          className={`px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${isAvailable
              ? 'bg-red-50 text-accent-red border border-red-200 hover:bg-red-100'
              : 'bg-emerald-50 text-accent-green border border-emerald-200 hover:bg-emerald-100'
            }`}
        >
          <Power className="w-4 h-4" />
          {isAvailable ? 'Go Off Duty' : 'Go Available'}
        </button>
      </GlassCard>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <GlassCard className="flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-accent-gold flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-2xl font-sora font-bold text-text-primary truncate">
              {stats.todaysBookings || 0}
            </div>
            <div className="text-[10px] sm:text-xs text-text-muted font-bold uppercase tracking-wider">Today's Jobs</div>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-accent-blue flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-2xl font-sora font-bold text-text-primary truncate">
              {stats.pendingRequests || 0}
            </div>
            <div className="text-[10px] sm:text-xs text-text-muted font-bold uppercase tracking-wider">Pending Requests</div>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Bell className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-2xl font-sora font-bold text-text-primary truncate">
              {stats.unreadNotifications || 0}
            </div>
            <div className="text-[10px] sm:text-xs text-text-muted font-bold uppercase tracking-wider">Unread Alerts</div>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-accent-green flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-2xl font-sora font-bold text-text-primary truncate">
              {stats.completedJobs || 0}
            </div>
            <div className="text-[10px] sm:text-xs text-text-muted font-bold uppercase tracking-wider">Completed Jobs</div>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-accent-red flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-2xl font-sora font-bold text-text-primary truncate">
              {stats.notCompletedJobs || 0}
            </div>
            <div className="text-[10px] sm:text-xs text-text-muted font-bold uppercase tracking-wider">Not Completed</div>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4 hover:shadow-md transition-shadow border-accent-gold/10">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-600 flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-2xl font-sora font-bold text-text-primary truncate">
              {stats.totalJobs || 0}
            </div>
            <div className="text-[10px] sm:text-xs text-text-muted font-bold uppercase tracking-wider">Total Lifetime Jobs</div>
          </div>
        </GlassCard>
      </div>

      {/* New: Nearby Broadcasted Jobs Quick Access */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 px-2">
           <h3 className="font-sora font-bold text-lg text-text-primary flex items-center gap-2">
             <Sparkles className="w-5 h-5 text-accent-gold" /> Job Requests in Your Area
           </h3>
           <Link to="/worker/available-jobs" className="text-xs font-bold text-accent-gold hover:underline flex items-center gap-1">
             View All Available Jobs <ArrowRight className="w-4 h-4" />
           </Link>
        </div>

        <GlassCard className="p-8 text-center bg-gradient-to-br from-amber-50 to-white border-dashed border-2 border-accent-gold/20">
           <Briefcase className="w-12 h-12 text-accent-gold/30 mx-auto mb-4" />
           <p className="text-sm font-medium text-text-primary mb-2">Want to earn more? Check out broadcasted requests.</p>
           <p className="text-xs text-text-muted mb-6">Customers in your category are posting jobs that any qualified professional can accept.</p>
           <PremiumButton variant="gold" onClick={() => navigate('/worker/available-jobs')}>
              Check Available Jobs Near Me
           </PremiumButton>
        </GlassCard>
      </div>

    </DashboardLayout>
  );
};

export default WorkerDashboard;

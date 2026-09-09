import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, MapPin, Calendar, Clock, ArrowRight, CheckCircle2, User, Briefcase, RefreshCw } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import PremiumButton from '../../components/common/PremiumButton';
import Badge from '../../components/common/Badge';
import { useNotification } from '../../context/NotificationContext';
import API from '../../services/api';

const AvailableJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const { showToast } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAvailableJobs();
  }, []);

  const fetchAvailableJobs = async () => {
    setLoading(true);
    try {
      const res = await API.get('/bookings/available');
      if (res.success) {
        setJobs(res.data.bookings || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptJob = async (jobId) => {
    if (!window.confirm('Initialize operational link with this consumer?')) return;

    setAcceptingId(jobId);
    try {
      const res = await API.put(`/bookings/${jobId}/accept`);
      if (res.success) {
        showToast('Link Established', 'Job module assigned to your terminal.', 'success');
        navigate('/worker/bookings');
      }
    } catch (err) {
      showToast('Error', err.message || 'Signal lost or intercepted by other node.', 'error');
      fetchAvailableJobs();
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <DashboardLayout
      title="Opportunity Scanner"
      subtitle="Monitoring market broadcasts for unassigned service nodes"
    >
      <div className="flex justify-end mb-8 px-2">
         <button
          onClick={fetchAvailableJobs}
          className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-background-widget border border-border-primary/30 text-[10px] font-black text-accent-bright uppercase tracking-widest hover:bg-background-secondary transition-all shadow-xl"
         >
           <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Grid
         </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent-bright border-t-transparent shadow-orange" />
        </div>
      ) : jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {jobs.map((job) => (
            <GlassCard key={job._id} goldBorder className="flex flex-col h-full animate-slide-up !bg-background-card border-border-primary/40 shadow-2xl relative overflow-hidden group hover:border-accent-orange transition-all duration-500">
               <div className="absolute top-0 right-0 w-24 h-24 bg-accent-orange/5 blur-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="p-6 sm:p-8 flex-1 flex flex-col relative z-10">
                {/* Header: Customer Info */}
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/5">
                  <img
                    src={job.customer?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.customer?.name)}&background=F4510B&color=fff`}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-accent-main shadow-xl"
                  />
                  <div className="min-w-0">
                    <h3 className="text-base font-black text-white leading-tight uppercase tracking-tight truncate">{job.customer?.name}</h3>
                    <p className="text-[10px] text-text-muted font-bold flex items-center gap-2 mt-1 uppercase tracking-widest">
                      <MapPin className="w-3 h-3 text-accent-bright" /> {job.broadcastArea?.city}
                    </p>
                  </div>
                  <Badge variant="gold" size="xs" className="ml-auto font-black shadow-lg">
                    {job.category?.name}
                  </Badge>
                </div>

                {/* Job Details */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">
                    <Calendar className="w-4 h-4 text-accent-bright" />
                    <span>{new Date(job.scheduledDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">
                    <Clock className="w-4 h-4 text-accent-light" />
                    <span>{job.scheduledTime} WINDOW</span>
                  </div>
                  <div className="flex items-start gap-3 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">
                    <MapPin className="w-4 h-4 text-accent-main mt-0.5" />
                    <span className="line-clamp-2 leading-relaxed opacity-80">
                      {job.address?.street}, {job.address?.city}
                    </span>
                  </div>
                  <div className="bg-background-dark/50 rounded-2xl p-5 border border-white/5 shadow-inner mt-6">
                    <p className="text-xs sm:text-sm text-text-primary line-clamp-3 leading-relaxed font-bold italic opacity-90">
                      "{job.description}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">EST. PAYOUT</span>
                      <span className="font-black text-xl text-accent-bright tracking-tighter">₹{job.estimatedCost}</span>
                   </div>
                   <div className="text-right">
                      <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">DETECTION TIME</span>
                      <p className="text-[10px] font-bold text-white uppercase tracking-tighter mt-0.5">
                        {new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                   </div>
                </div>
              </div>

              {/* Action */}
              <div className="p-4 bg-background-widget/40 rounded-b-[1.5rem] border-t border-white/5 relative z-10">
                <PremiumButton
                  fullWidth
                  variant="gold"
                  size="md"
                  icon={CheckCircle2}
                  loading={acceptingId === job._id}
                  onClick={() => handleAcceptJob(job._id)}
                  className="py-5 shadow-orange font-black tracking-widest"
                >
                  INITIALIZE LINK
                </PremiumButton>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="py-40 text-center bg-background-cardSecondary/40 rounded-[4rem] border-2 border-dashed border-border-primary/30 shadow-inner relative overflow-hidden">
           <div className="absolute inset-0 bg-accent-orange/5 blur-[100px] pointer-events-none" />
           <div className="w-24 h-24 bg-background-dark rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl border border-white/5 relative z-10">
              <Sparkles className="w-12 h-12 text-accent-bright opacity-20" />
           </div>
           <h3 className="font-sora font-black text-2xl text-white mb-4 relative z-10">NO ACTIVE SIGNALS DETECTED</h3>
           <p className="text-sm text-text-muted max-w-[320px] mx-auto leading-relaxed font-bold uppercase tracking-widest opacity-80 mb-10 relative z-10">
             The market sector is currently dormant. Our algorithms will notify your terminal once a new broadcast is intercepted.
           </p>
           <PremiumButton variant="outline" size="lg" className="px-12 relative z-10" onClick={fetchAvailableJobs}>
             FORCE RE-SCAN
           </PremiumButton>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AvailableJobs;

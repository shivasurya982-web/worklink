import { getImageUrl, handleImageError, DEFAULT_AVATAR } from '../../utils/imageUtils';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, MapPin, Calendar, Clock, CheckCircle2, RefreshCw } from 'lucide-react';
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
    if (!window.confirm('Accept this job request from the customer?')) return;

    setAcceptingId(jobId);
    try {
      const res = await API.put(`/bookings/${jobId}/accept`);
      if (res.success) {
        showToast('Job Accepted', 'This job has been added to your dashboard.', 'success');
        navigate('/worker/bookings');
      }
    } catch (err) {
      showToast('Error', err.message || 'Job is no longer available.', 'error');
      fetchAvailableJobs();
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <DashboardLayout
      title="Job Openings"
      subtitle="See latest job requests from customers"
    >
      <div className="flex justify-end mb-6 px-1">
         <button
          onClick={fetchAvailableJobs}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-[10px] font-black text-accent-main uppercase tracking-wider hover:bg-orange-50 transition-all shadow-xs cursor-pointer"
         >
           <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
         </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-main border-t-transparent" />
        </div>
      ) : jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <GlassCard key={job._id} goldBorder className="flex flex-col h-full animate-slide-up !bg-white/80 border border-white/60 shadow-xs relative overflow-hidden group hover:border-accent-main transition-all">
              <div className="p-6 flex-1 flex flex-col relative z-10">
                {/* Header: Customer Info */}
                <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-gray-100">
                  <img
                    src={getImageUrl(job.customer?.avatar, DEFAULT_AVATAR(job.customer?.name))} onError={(e) => handleImageError(e, DEFAULT_AVATAR(job.customer?.name))}
                    className="w-12 h-12 rounded-xl object-cover border border-accent-main shadow-xs"
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-text-primary leading-tight uppercase tracking-tight truncate">{job.customer?.name}</h3>
                    <p className="text-[10px] text-text-muted font-semibold flex items-center gap-1.5 mt-0.5 uppercase tracking-wider">
                      <MapPin className="w-3 h-3 text-accent-main" /> {job.broadcastArea?.city}
                    </p>
                  </div>
                  <Badge variant="gold" size="xs" className="ml-auto font-black">
                    {job.category?.name}
                  </Badge>
                </div>

                {/* Job Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2.5 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5 text-accent-main" />
                    <span>{new Date(job.scheduledDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-accent-main" />
                    <span>{job.scheduledTime}</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-accent-main mt-0.5" />
                    <span className="line-clamp-2 leading-relaxed">
                      {job.address?.street}, {job.address?.city}
                    </span>
                  </div>
                  <div className="bg-orange-50/50 rounded-xl p-4 border border-orange-100/60 mt-4">
                    <p className="text-xs text-text-primary line-clamp-3 leading-relaxed font-semibold italic">
                      "{job.description}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-text-muted uppercase tracking-wider">PAYOUT</span>
                      <span className="font-black text-lg text-accent-main tracking-tight">₹{job.estimatedCost}</span>
                   </div>
                </div>
              </div>

              {/* Action */}
              <div className="p-3 bg-gray-50 rounded-b-[1.5rem] border-t border-gray-100 relative z-10">
                <PremiumButton
                  fullWidth
                  variant="black"
                  size="md"
                  icon={CheckCircle2}
                  loading={acceptingId === job._id}
                  onClick={() => handleAcceptJob(job._id)}
                  className="py-3.5 text-xs font-black uppercase tracking-wider"
                >
                  ACCEPT JOB
                </PremiumButton>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="py-28 text-center bg-white/60 rounded-[3rem] border-2 border-dashed border-gray-200 shadow-xs relative overflow-hidden">
           <div className="w-20 h-20 bg-orange-50/80 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-orange-100/80">
              <Sparkles className="w-10 h-10 text-accent-main" />
           </div>
           <h3 className="font-sora font-black text-2xl text-text-primary mb-2">NO JOBS FOUND</h3>
           <p className="text-xs text-text-muted max-w-[280px] mx-auto leading-relaxed font-semibold uppercase tracking-wider mb-8">
             There are no new job requests at the moment. We will notify you when a customer needs help.
           </p>
           <PremiumButton variant="outline" size="lg" className="px-10" onClick={fetchAvailableJobs}>
             CHECK AGAIN
           </PremiumButton>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AvailableJobs;

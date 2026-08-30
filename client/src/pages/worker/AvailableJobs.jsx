import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, MapPin, Calendar, Clock, ArrowRight, CheckCircle2, User, Briefcase } from 'lucide-react';
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
    if (!window.confirm('Are you sure you want to accept this job?')) return;

    setAcceptingId(jobId);
    try {
      const res = await API.put(`/bookings/${jobId}/accept`);
      if (res.success) {
        showToast('Job Accepted!', 'This booking has been assigned to you.', 'success');
        navigate('/worker/bookings');
      }
    } catch (err) {
      showToast('Error', err.message || 'Job might have been taken by someone else.', 'error');
      fetchAvailableJobs(); // Refresh list
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <DashboardLayout
      title="Available Job Opportunities 💼"
      subtitle="Job requests from nearby customers waiting for a professional"
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-gold border-t-transparent" />
        </div>
      ) : jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <GlassCard key={job._id} goldBorder className="flex flex-col h-full animate-slide-up">
              <div className="p-5 flex-1">
                {/* Header: Customer Info */}
                <div className="flex items-center gap-3 mb-5">
                  <img
                    src={job.customer?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.customer?.name)}&background=random`}
                    className="w-10 h-10 rounded-full object-cover border border-gray-100"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-text-primary leading-none mb-1">{job.customer?.name}</h3>
                    <p className="text-[10px] text-text-muted flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {job.broadcastArea?.city}
                    </p>
                  </div>
                  <Badge variant="gold" size="xs" className="ml-auto">
                    {job.category?.name}
                  </Badge>
                </div>

                {/* Job Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Calendar className="w-3.5 h-3.5 text-accent-gold" />
                    <span>{new Date(job.scheduledDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Clock className="w-3.5 h-3.5 text-accent-gold" />
                    <span>{job.scheduledTime}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-text-secondary">
                    <MapPin className="w-3.5 h-3.5 text-accent-gold mt-0.5" />
                    <span className="line-clamp-2">
                      {job.address?.street}, {job.address?.city}, {job.address?.state} {job.address?.zip}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-text-primary line-clamp-3 leading-relaxed italic">
                      "{job.description}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                   <div className="text-[10px] text-text-muted">
                      Budget Estimate: <span className="font-bold text-accent-gold ml-1">₹{job.estimatedCost}</span>
                   </div>
                   <div className="text-[10px] text-text-muted">
                      Posted: {new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </div>
                </div>
              </div>

              {/* Action */}
              <div className="p-3 bg-gray-50/50 rounded-b-3xl">
                <PremiumButton
                  fullWidth
                  variant="gold"
                  size="sm"
                  icon={CheckCircle2}
                  loading={acceptingId === job._id}
                  onClick={() => handleAcceptJob(job._id)}
                >
                  Accept & Start Job
                </PremiumButton>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center bg-white rounded-[40px] border border-dashed border-gray-200">
           <Sparkles className="w-12 h-12 text-gray-200 mx-auto mb-4" />
           <h3 className="font-sora font-bold text-text-primary text-lg">No New Jobs Found Nearby</h3>
           <p className="text-sm text-text-muted max-w-xs mx-auto mt-2">
             We'll notify you as soon as a customer in your area broadcasts a job request in your category.
           </p>
           <PremiumButton variant="outline" className="mt-6" onClick={fetchAvailableJobs}>
             Check for Updates
           </PremiumButton>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AvailableJobs;

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import PremiumButton from '../../components/common/PremiumButton';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import { AlertCircle, PlusCircle, CheckCircle2, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import API from '../../services/api';

const WorkerComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    subject: '',
    category: 'Customer Behavior',
    description: '',
    bookingId: '',
    priority: 'medium',
  });

  const { showToast } = useNotification();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [compRes, bookRes] = await Promise.all([
        API.get('/complaints'),
        API.get('/bookings'),
      ]);
      if (compRes.success) setComplaints(compRes.data || []);
      if (bookRes.success) setBookings(bookRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.description) {
      showToast('Error', 'Please fill all required fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await API.post('/complaints', formData);
      if (res.success) {
        showToast('Report Sent', 'We have received your message.', 'success');
        setModalOpen(false);
        setFormData({
          subject: '',
          category: 'Customer Behavior',
          description: '',
          bookingId: '',
          priority: 'medium',
        });
        fetchData();
      }
    } catch (err) {
      showToast('Error', err.message || 'Failed to send report', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const statusVariant = (status) => {
    switch (status) {
      case 'resolved': return 'success';
      case 'in_review': return 'orange';
      case 'rejected': return 'danger';
      default: return 'warning';
    }
  };

  return (
    <DashboardLayout
      title="Help & Support"
      subtitle="Report any issues with customers or jobs to our team"
    >
      <div className="mb-6 p-5 rounded-2xl bg-orange-50/80 border border-orange-100 flex items-start gap-3 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-accent-main shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-black text-text-primary uppercase tracking-wider">Support for Workers</p>
          <p className="text-[11px] text-text-secondary mt-1 font-semibold leading-relaxed uppercase tracking-wide">If you have issues with payment or customer behavior, please let us know. Our team will look into it and help you resolve the problem.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h3 className="font-sora font-black text-lg text-text-primary flex items-center gap-2 uppercase tracking-tight">
          <AlertCircle className="w-6 h-6 text-accent-main" /> My Support Requests ({complaints.length})
        </h3>
        <PremiumButton
          variant="gold"
          size="lg"
          icon={PlusCircle}
          onClick={() => setModalOpen(true)}
          className="w-full sm:w-auto px-8"
        >
          New Request
        </PremiumButton>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-main border-t-transparent" />
        </div>
      ) : complaints.length > 0 ? (
        <div className="space-y-4">
          {complaints.map((c) => (
            <GlassCard key={c._id} className="p-6 !bg-white/80 border border-white/60 space-y-4 shadow-xs relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 pb-4 relative z-10">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="font-sora font-black text-lg text-text-primary uppercase tracking-tight truncate">{c.subject}</h4>
                    <Badge variant="orange" size="xs" className="!rounded-lg px-3 py-0.5 font-bold text-[9px]">
                      {c.category.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                       <Clock className="w-3.5 h-3.5 text-accent-main" /> Sent on {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  <Badge variant={statusVariant(c.status)} className="!rounded-xl px-4 py-1.5 font-bold uppercase text-[10px]">
                    {c.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </div>

              <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100/60 relative">
                 <p className="text-xs text-text-secondary leading-relaxed font-semibold italic">
                    "{c.description}"
                 </p>
              </div>

              {c.resolutionNotes && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 animate-fade-in">
                  <span className="font-bold text-emerald-700 block mb-1 uppercase tracking-wider flex items-center gap-1.5 text-[10px]">
                    <CheckCircle2 className="w-4 h-4" /> Support Response:
                  </span>
                  <p className="text-xs text-text-primary font-bold">{c.resolutionNotes}</p>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white/60 rounded-[2.5rem] border-2 border-dashed border-gray-200">
           <div className="w-16 h-16 rounded-2xl bg-orange-50 text-accent-main flex items-center justify-center mx-auto mb-4 border border-orange-100">
              <Sparkles className="w-8 h-8" />
           </div>
           <h3 className="font-sora font-black text-xl text-text-primary uppercase tracking-tight">No Reports Yet</h3>
           <p className="max-w-xs mx-auto text-xs font-semibold text-text-muted uppercase tracking-wider mt-2 leading-relaxed">You haven't reported any issues yet. We're here to help if you need us.</p>
           <PremiumButton
             variant="gold"
             size="lg"
             className="mt-8 px-10"
             onClick={() => setModalOpen(true)}
           >
             Create Support Request
           </PremiumButton>
        </div>
      )}

      {/* Lodge Complaint Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="SEND A REPORT TO SUPPORT"
      >
        <form onSubmit={handleSubmit} className="space-y-6 pt-2 pb-2">
          <div className="space-y-4 bg-white/60 p-5 sm:p-6 rounded-2xl border border-white/60">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-accent-main uppercase tracking-widest ml-1">What is the problem?</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-text-primary focus:outline-none focus:border-accent-main uppercase tracking-wider"
              >
                <option value="Customer Behavior">Customer Behavior</option>
                <option value="Payment Problem">Payment Problem</option>
                <option value="Service Issue">Job Details Wrong</option>
                <option value="App Bug">App Bug</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-accent-main uppercase tracking-widest ml-1">Which job was this for? (Optional)</label>
              <select
                value={formData.bookingId}
                onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-text-primary focus:outline-none focus:border-accent-main uppercase tracking-wider"
              >
                <option value="">-- Select a customer --</option>
                {bookings.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.customer?.name || 'Customer'} - {new Date(b.scheduledDate).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-accent-main uppercase tracking-widest ml-1">Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Short title of the issue..."
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-text-primary focus:outline-none focus:border-accent-main uppercase tracking-wider placeholder:text-text-muted"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-accent-main uppercase tracking-widest ml-1">Tell us more</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Explain what happened here..."
                className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-xs font-bold text-text-primary focus:outline-none focus:border-accent-main uppercase tracking-wider placeholder:text-text-muted"
                required
              />
            </div>
          </div>

          <PremiumButton type="submit" variant="gold" size="lg" fullWidth loading={submitting} className="py-4 font-black">
            SEND TO SUPPORT
          </PremiumButton>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default WorkerComplaints;

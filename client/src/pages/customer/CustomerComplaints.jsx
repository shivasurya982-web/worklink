import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import PremiumButton from '../../components/common/PremiumButton';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import { AlertCircle, PlusCircle, MessageSquare, Clock, CheckCircle2, XCircle, Sparkles, ShieldCheck } from 'lucide-react';
import API from '../../services/api';

const CustomerComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    subject: '',
    category: 'Service Issue',
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
        showToast('Complaint Sent', 'We have received your report.', 'success');
        setModalOpen(false);
        setFormData({
          subject: '',
          category: 'Service Issue',
          description: '',
          bookingId: '',
          priority: 'medium',
        });
        fetchData();
      }
    } catch (err) {
      showToast('Error', err.message || 'Failed to send complaint', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const statusVariant = (status) => {
    switch (status) {
      case 'resolved': return 'success';
      case 'in_review': return 'blue';
      case 'rejected': return 'danger';
      default: return 'warning';
    }
  };

  return (
    <DashboardLayout
      title="Support Tickets"
      subtitle="Talk to our support team about any issues"
    >
      {/* Info Banner */}
      <div className="mb-8 p-6 rounded-[2rem] bg-accent-orange/10 border border-accent-orange/30 flex items-start gap-4 shadow-xl">
        <ShieldCheck className="w-6 h-6 text-accent-bright shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-black text-white uppercase tracking-widest">Help & Support</p>
          <p className="text-[11px] text-text-secondary mt-2 font-bold opacity-80 leading-relaxed uppercase tracking-wider">Our support team will review your message and get back to you as soon as possible. You can check the status of your tickets below.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-6">
        <h3 className="font-sora font-black text-xl text-white flex items-center gap-3 uppercase tracking-tighter">
          <AlertCircle className="w-7 h-7 text-accent-bright" /> My Tickets ({complaints.length})
        </h3>
        <PremiumButton
          variant="gold"
          size="lg"
          icon={PlusCircle}
          onClick={() => setModalOpen(true)}
          className="w-full sm:w-auto px-10 shadow-orange"
        >
          New Ticket
        </PremiumButton>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent-bright border-t-transparent shadow-orange" />
        </div>
      ) : complaints.length > 0 ? (
        <div className="space-y-6">
          {complaints.map((c) => (
            <GlassCard key={c._id} className="p-8 !bg-background-card border-border-primary/40 space-y-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-orange/5 blur-3xl pointer-events-none" />

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/5 pb-6 relative z-10">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-4 flex-wrap">
                    <h4 className="font-sora font-black text-xl text-white uppercase tracking-tight truncate">{c.subject}</h4>
                    <Badge variant="blue" size="xs" className="!rounded-lg px-3 py-1 font-black text-[9px]">
                      {c.category.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                       <Clock className="w-3.5 h-3.5" /> Sent on {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  <Badge variant={statusVariant(c.status)} className="!rounded-xl px-6 py-2.5 font-black uppercase text-[11px] shadow-xl">
                    {c.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </div>

              <div className="bg-background-dark/50 p-6 rounded-[2rem] border border-white/5 shadow-inner relative">
                 <p className="text-sm text-text-secondary leading-relaxed font-bold italic opacity-90">
                    "{c.description}"
                 </p>
              </div>

              {c.resolutionNotes && (
                <div className="p-6 bg-accent-orange/5 rounded-[2rem] border border-accent-orange/30 shadow-inner animate-fade-in">
                  <span className="font-black text-accent-bright block mb-2 uppercase tracking-widest flex items-center gap-2 text-[10px]">
                    <CheckCircle2 className="w-4 h-4" /> Support Reply:
                  </span>
                  <p className="text-sm text-text-primary font-bold">{c.resolutionNotes}</p>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-background-cardSecondary/40 rounded-[4rem] border-2 border-dashed border-border-primary/20 shadow-inner group">
           <div className="w-20 h-20 rounded-[1.5rem] bg-background-dark text-accent-bright flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/5 group-hover:scale-110 transition-all opacity-20">
              <Sparkles className="w-10 h-10" />
           </div>
           <h3 className="font-sora font-black text-2xl text-white uppercase tracking-tighter">No Tickets Found</h3>
           <p className="max-w-xs mx-auto text-xs font-bold text-text-muted uppercase tracking-widest mt-3 leading-relaxed opacity-70">You haven't sent any support requests yet.</p>
           <PremiumButton
             variant="gold"
             size="lg"
             className="mt-10 px-12 shadow-orange"
             onClick={() => setModalOpen(true)}
           >
             Create My First Ticket
           </PremiumButton>
        </div>
      )}

      {/* Lodge Complaint Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="SEND SUPPORT REQUEST"
      >
        <form onSubmit={handleSubmit} className="space-y-8 pt-4 pb-2">
          <div className="space-y-6 bg-background-dark/50 p-8 rounded-[2.5rem] border border-white/5 shadow-inner">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-accent-light uppercase tracking-widest ml-2">What is the issue about?</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-background-card border-2 border-border-primary/30 rounded-2xl px-5 py-4 text-xs font-black text-white focus:outline-none focus:border-accent-main shadow-2xl uppercase tracking-widest appearance-none"
              >
                <option value="Service Issue">Service Issue</option>
                <option value="Payment Problem">Payment Problem</option>
                <option value="Worker Conduct">Worker Conduct</option>
                <option value="App Bug">App Bug</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-accent-light uppercase tracking-widest ml-2">Which booking is this for? (Optional)</label>
              <select
                value={formData.bookingId}
                onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
                className="w-full bg-background-card border-2 border-border-primary/30 rounded-2xl px-5 py-4 text-xs font-black text-white focus:outline-none focus:border-accent-main shadow-2xl uppercase tracking-widest appearance-none"
              >
                <option value="">-- Select a booking --</option>
                {bookings.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.worker?.name || 'Worker'} - {new Date(b.scheduledDate).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-accent-light uppercase tracking-widest ml-2">Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Give a short title to your issue..."
                className="w-full bg-background-card border-2 border-border-primary/30 rounded-2xl px-5 py-4 text-xs font-bold text-white focus:outline-none focus:border-accent-main shadow-2xl uppercase tracking-widest placeholder:text-text-muted"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-accent-light uppercase tracking-widest ml-2">Description</label>
              <textarea
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Explain the problem in detail here..."
                className="w-full bg-background-card border-2 border-border-primary/30 rounded-[2rem] p-6 text-sm font-bold text-white focus:outline-none focus:border-accent-main shadow-2xl uppercase tracking-wider placeholder:text-text-muted"
                required
              />
            </div>
          </div>

          <PremiumButton type="submit" variant="gold" size="lg" fullWidth loading={submitting} className="py-5 shadow-orange font-black">
            SEND TO SUPPORT
          </PremiumButton>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default CustomerComplaints;

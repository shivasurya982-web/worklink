import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import PremiumButton from '../../components/common/PremiumButton';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import { AlertCircle, PlusCircle, CheckCircle2 } from 'lucide-react';
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
      showToast('Validation Error', 'Please fill subject and description.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await API.post('/complaints', formData);
      if (res.success) {
        showToast('Complaint Lodged', 'Your report has been sent to Admin.', 'success');
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
      showToast('Error', err.message || 'Failed to submit complaint', 'error');
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
      title="Worker Complaints & Support"
      subtitle="Report client issues, unpaid jobs, or safety concerns directly to Admin"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-sora font-semibold text-sm text-text-primary flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-accent-blue" /> My Reports & Tickets ({complaints.length})
        </h3>
        <PremiumButton
          variant="gold"
          size="sm"
          icon={PlusCircle}
          onClick={() => setModalOpen(true)}
        >
          Lodge New Report
        </PremiumButton>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-gold border-t-transparent" />
        </div>
      ) : complaints.length > 0 ? (
        <div className="space-y-4">
          {complaints.map((c) => (
            <GlassCard key={c._id} hover={false} className="p-6 border border-gray-100 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-sora font-bold text-sm text-text-primary">{c.subject}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 font-semibold text-text-muted">
                      {c.category}
                    </span>
                  </div>
                  <p className="text-[10px] text-text-muted mt-1">
                    Submitted on {new Date(c.createdAt).toLocaleDateString()} at {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={statusVariant(c.status)}>
                    {c.status.toUpperCase().replace(/_/g, ' ')}
                  </Badge>
                </div>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                "{c.description}"
              </p>

              {c.resolutionNotes && (
                <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-900 border border-amber-200">
                  <span className="font-bold text-accent-gold block mb-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent-gold" /> Admin Resolution Note:
                  </span>
                  {c.resolutionNotes}
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="text-center py-12 text-xs text-text-muted">
          No reports lodged yet. Click "Lodge New Report" if you encounter any issue with a customer or booking.
        </GlassCard>
      )}

      {/* Lodge Complaint Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Lodge a Worker Support Report"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-text-primary block mb-1">Issue Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-accent-gold font-medium"
            >
              <option value="Customer Behavior">Customer Behavior</option>
              <option value="Payment Problem">Payment Problem</option>
              <option value="Service Issue">Job Details Mismatch</option>
              <option value="App Bug">App Bug</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-primary block mb-1">Related Job (Optional)</label>
            <select
              value={formData.bookingId}
              onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-accent-gold font-medium"
            >
              <option value="">-- Select Job (Optional) --</option>
              {bookings.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.customer?.name || 'Customer'} - {new Date(b.scheduledDate).toLocaleDateString()} ({b.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-primary block mb-1">Report Subject</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Brief summary of the issue..."
              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-accent-gold"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-primary block mb-1">Detailed Description</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Explain the situation in detail..."
              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-accent-gold"
              required
            />
          </div>

          <PremiumButton type="submit" variant="gold" size="lg" fullWidth loading={submitting}>
            Submit Report to Admin
          </PremiumButton>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default WorkerComplaints;

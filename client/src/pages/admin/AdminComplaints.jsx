import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import PremiumButton from '../../components/common/PremiumButton';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import { AlertCircle, CheckCircle2, XCircle, Clock, Search, ShieldCheck, Trash2 } from 'lucide-react';
import API from '../../services/api';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, open, in_review, resolved, rejected
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [newStatus, setNewStatus] = useState('resolved');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const { showToast } = useNotification();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await API.get('/complaints/admin/all');
      if (res.success) {
        setComplaints(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenActionModal = (c) => {
    setSelectedComplaint(c);
    setNewStatus(c.status === 'open' ? 'in_review' : c.status);
    setResolutionNotes(c.resolutionNotes || '');
    setModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setUpdating(true);
    try {
      const res = await API.put(`/complaints/admin/${selectedComplaint._id}`, {
        status: newStatus,
        resolutionNotes,
      });

      if (res.success) {
        showToast('Status Updated', `Complaint status updated to ${newStatus}.`, 'success');
        setModalOpen(false);
        fetchComplaints();
      }
    } catch (err) {
      showToast('Error', err.message || 'Failed to update complaint', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteComplaint = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this complaint?')) return;

    setDeleting(true);
    try {
      const res = await API.delete(`/complaints/admin/${id}`);
      if (res.success) {
        showToast('Complaint Deleted', 'The complaint record has been removed.', 'info');
        setComplaints(prev => prev.filter(c => c._id !== id));
      }
    } catch (err) {
      showToast('Error', err.message || 'Failed to delete complaint', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    if (activeTab === 'all') return true;
    return c.status === activeTab;
  });

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
      title="Complaints & Support Control Center"
      subtitle="Review customer & worker reports, assign priorities, and log official resolutions"
    >
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-100 pb-3">
        {[
          { id: 'all', label: `All (${complaints.length})` },
          { id: 'open', label: `Open (${complaints.filter((c) => c.status === 'open').length})` },
          { id: 'in_review', label: `In Review (${complaints.filter((c) => c.status === 'in_review').length})` },
          { id: 'resolved', label: `Resolved (${complaints.filter((c) => c.status === 'resolved').length})` },
          { id: 'rejected', label: `Rejected (${complaints.filter((c) => c.status === 'rejected').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-accent-gold text-text-primary shadow-md font-bold'
                : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-gold border-t-transparent" />
        </div>
      ) : filteredComplaints.length > 0 ? (
        <div className="space-y-4">
          {filteredComplaints.map((c) => (
            <GlassCard key={c._id} hover={false} className="p-6 border border-gray-100 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-3">
                {/* Complainant User Info */}
                <div className="flex items-center gap-3">
                  <img
                    src={c.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user?.name || 'User')}&background=D4AF37&color=fff`}
                    alt={c.user?.name}
                    className="w-10 h-10 rounded-full object-cover border border-accent-gold/40 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-sora font-bold text-sm text-text-primary">{c.user?.name}</h4>
                      <Badge variant={c.userModel === 'Worker' ? 'blue' : 'gold'} size="xs">
                        {c.userModel}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      {c.user?.email} • {c.user?.phone || 'No phone'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={statusVariant(c.status)}>
                    {(c.status || 'open').toUpperCase().replace(/_/g, ' ')}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <PremiumButton
                      variant="gold"
                      size="sm"
                      onClick={() => handleOpenActionModal(c)}
                    >
                      Take Action
                    </PremiumButton>
                    <button
                      onClick={() => handleDeleteComplaint(c._id)}
                      className="p-2 rounded-xl bg-red-50 text-accent-red hover:bg-red-100 transition-all border border-red-100"
                      title="Delete Complaint"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Subject & Description */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-xs text-text-primary">{c.subject}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 font-semibold text-text-muted">
                    Category: {c.category}
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                  "{c.description}"
                </p>
              </div>

              {c.resolutionNotes && (
                <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-900 border border-emerald-200">
                  <span className="font-bold text-emerald-700 block mb-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent-green" /> Resolution Notes:
                  </span>
                  {c.resolutionNotes}
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="text-center py-12 text-xs text-text-muted">
          No complaints found in this tab status.
        </GlassCard>
      )}

      {/* Action Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={`Resolve Complaint: ${selectedComplaint?.subject}`}
        >
          <form onSubmit={handleUpdateStatus} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-text-primary block mb-1">Update Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-accent-gold font-bold"
              >
                <option value="in_review">In Review</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
                <option value="open">Re-open</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-primary block mb-1">Admin Resolution Notes</label>
              <textarea
                rows={4}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Write official resolution notes to inform the customer/worker..."
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-accent-gold"
                required
              />
            </div>

            <PremiumButton type="submit" variant="gold" size="lg" fullWidth loading={updating}>
              Save Complaint Resolution
            </PremiumButton>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default AdminComplaints;

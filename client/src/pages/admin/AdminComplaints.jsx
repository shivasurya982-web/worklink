import { getImageUrl, handleImageError, DEFAULT_AVATAR } from '../../utils/imageUtils';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import PremiumButton from '../../components/common/PremiumButton';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import { AlertCircle, CheckCircle2, ShieldCheck, Trash2 } from 'lucide-react';
import API from '../../services/api';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, open, in_review, resolved, rejected
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

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
        showToast('Updated', `Complaint status changed to ${newStatus}.`, 'success');
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
    if (!window.confirm('Delete this complaint record forever?')) return;

    try {
      const res = await API.delete(`/complaints/admin/${id}`);
      if (res.success) {
        showToast('Deleted', 'Complaint record removed.', 'info');
        setComplaints(prev => prev.filter(c => c._id !== id));
      }
    } catch (err) {
      showToast('Error', err.message || 'Failed to delete complaint', 'error');
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    if (activeTab === 'all') return true;
    return c.status === activeTab;
  });

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
      title="Manage Complaints"
      subtitle="View and resolve issues reported by users and workers"
    >
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-100 pb-4">
        {[
          { id: 'all', label: `ALL (${complaints.length})` },
          { id: 'open', label: `NEW (${complaints.filter((c) => c.status === 'open').length})` },
          { id: 'in_review', label: `IN REVIEW (${complaints.filter((c) => c.status === 'in_review').length})` },
          { id: 'resolved', label: `RESOLVED (${complaints.filter((c) => c.status === 'resolved').length})` },
          { id: 'rejected', label: `REJECTED (${complaints.filter((c) => c.status === 'rejected').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-accent-main text-white shadow-xs'
                : 'bg-white text-text-muted hover:text-text-primary border border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-main border-t-transparent" />
        </div>
      ) : filteredComplaints.length > 0 ? (
        <div className="space-y-4">
          {filteredComplaints.map((c) => (
            <GlassCard key={c._id} hover={false} className="p-6 !bg-white/80 border border-white/60 shadow-xs space-y-4 group relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4 relative z-10">
                {/* Complainant User Info */}
                <div className="flex items-center gap-4">
                  <img
                    src={getImageUrl(c.user?.avatar, DEFAULT_AVATAR(c.user?.name || 'User'))} onError={(e) => handleImageError(e, DEFAULT_AVATAR(c.user?.name || 'User'))}
                    alt={c.user?.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-accent-main shadow-xs shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-sora font-black text-lg text-text-primary tracking-tight uppercase">{c.user?.name}</h4>
                      <Badge variant={c.userModel === 'Worker' ? 'orange' : 'gold'} size="xs" className="font-bold uppercase">
                        {c.userModel}
                      </Badge>
                    </div>
                    <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-wider">
                      Email: {c.user?.email} | Phone: {c.user?.phone || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <Badge variant={statusVariant(c.status)} size="md" className="!rounded-xl px-4 font-bold uppercase">
                    {(c.status || 'open').replace(/_/g, ' ')}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <PremiumButton
                      variant="gold"
                      size="sm"
                      onClick={() => handleOpenActionModal(c)}
                      className="px-5 font-black"
                    >
                      Update
                    </PremiumButton>
                    <button
                      onClick={() => handleDeleteComplaint(c._id)}
                      className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all shadow-xs cursor-pointer"
                      title="Delete Ticket"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Subject & Description */}
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-50/80 flex items-center justify-center border border-orange-100/80"><AlertCircle className="w-4 h-4 text-accent-main" /></div>
                  <span className="font-black text-sm text-text-primary uppercase tracking-tight">{c.subject}</span>
                  <div className="bg-orange-50/80 px-2.5 py-0.5 rounded-lg border border-orange-100/80">
                    <span className="text-[9px] font-black text-accent-main uppercase tracking-wider">TYPE: {c.category}</span>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs relative">
                  <p className="text-xs text-text-secondary leading-relaxed font-semibold italic">
                    "{c.description}"
                  </p>
                </div>
              </div>

              {c.resolutionNotes && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 animate-fade-in relative z-10">
                  <span className="font-bold text-emerald-700 block mb-1 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Support Team Response:
                  </span>
                  <p className="text-xs font-bold text-text-primary leading-relaxed">{c.resolutionNotes}</p>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white/60 rounded-[2.5rem] border-2 border-dashed border-gray-200">
           <div className="w-16 h-16 bg-orange-50/80 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-orange-100/80">
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
           </div>
           <p className="text-xs font-bold text-text-muted uppercase tracking-wider">NO COMPLAINTS FOUND HERE.</p>
        </div>
      )}

      {/* Action Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={`Update Complaint: ${selectedComplaint?.subject}`}
        >
          <form onSubmit={handleUpdateStatus} className="space-y-6 pt-2">
            <div className="bg-orange-50/60 p-6 rounded-2xl border border-orange-100/80 space-y-4">
              <div>
                <label className="text-[10px] font-black text-accent-main uppercase tracking-widest block mb-2">STATUS</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-bold text-text-primary focus:outline-none focus:border-accent-main uppercase tracking-wider"
                >
                  <option value="in_review">Mark as Under Review</option>
                  <option value="resolved">Mark as Resolved</option>
                  <option value="rejected">Mark as Rejected</option>
                  <option value="open">Keep as New</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-accent-main uppercase tracking-widest block mb-2">REPLY TO USER</label>
                <textarea
                  rows={4}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Tell the user how you are fixing this..."
                  className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-xs font-bold focus:outline-none focus:border-accent-main text-text-primary"
                  required
                />
              </div>
            </div>

            <PremiumButton type="submit" variant="gold" size="lg" fullWidth loading={updating} className="py-4 font-black">
              SAVE UPDATE
            </PremiumButton>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default AdminComplaints;

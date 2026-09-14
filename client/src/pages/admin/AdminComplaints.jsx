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

    setDeleting(true);
    try {
      const res = await API.delete(`/complaints/admin/${id}`);
      if (res.success) {
        showToast('Deleted', 'Complaint record removed.', 'info');
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
      title="Manage Complaints"
      subtitle="View and resolve issues reported by users and workers"
    >
      {/* Tabs */}
      <div className="flex flex-wrap gap-3 mb-10 border-b border-white/5 pb-5">
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
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id
                ? 'bg-accent-orange text-white shadow-xl scale-105'
                : 'bg-background-cardSecondary text-text-muted hover:text-white border border-border-primary/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent-bright border-t-transparent shadow-orange" />
        </div>
      ) : filteredComplaints.length > 0 ? (
        <div className="space-y-6">
          {filteredComplaints.map((c) => (
            <GlassCard key={c._id} hover={false} className="p-6 sm:p-8 !bg-background-card border-border-primary/40 shadow-2xl space-y-6 group relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-accent-orange/5 blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6 relative z-10">
                {/* Complainant User Info */}
                <div className="flex items-center gap-5">
                  <img
                    src={c.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user?.name || 'User')}&background=F4510B&color=fff`}
                    alt={c.user?.name}
                    className="w-16 h-16 rounded-[1.5rem] object-cover border-2 border-accent-main shadow-2xl shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className="font-sora font-black text-xl text-white tracking-tighter uppercase">{c.user?.name}</h4>
                      <Badge variant={c.userModel === 'Worker' ? 'blue' : 'gold'} size="xs" className="font-black uppercase">
                        {c.userModel}
                      </Badge>
                    </div>
                    <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-widest opacity-80">
                      Email: {c.user?.email} | Phone: {c.user?.phone || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
                  <Badge variant={statusVariant(c.status)} size="md" className="!rounded-xl px-5 font-black uppercase">
                    {(c.status || 'open').replace(/_/g, ' ')}
                  </Badge>
                  <div className="flex items-center gap-3">
                    <PremiumButton
                      variant="gold"
                      size="sm"
                      onClick={() => handleOpenActionModal(c)}
                      className="px-6 shadow-orange font-black"
                    >
                      Update
                    </PremiumButton>
                    <button
                      onClick={() => handleDeleteComplaint(c._id)}
                      className="p-3 rounded-2xl bg-red-950/20 text-red-400 border border-red-500/20 hover:bg-red-900/30 transition-all shadow-xl"
                      title="Delete Ticket"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Subject & Description */}
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-background-widget flex items-center justify-center border border-accent-bright/20"><AlertCircle className="w-4 h-4 text-accent-bright" /></div>
                  <span className="font-black text-sm text-white uppercase tracking-tight">{c.subject}</span>
                  <div className="bg-background-dark/50 px-3 py-1 rounded-lg border border-white/5">
                    <span className="text-[9px] font-black text-accent-light uppercase tracking-widest">TYPE: {c.category}</span>
                  </div>
                </div>
                <div className="bg-background-dark/30 p-6 rounded-[2rem] border-2 border-white/5 shadow-inner relative group min-h-[100px] hover:border-accent-main/20 transition-all">
                  <p className="text-sm text-text-secondary leading-relaxed font-bold italic opacity-90 pr-8">
                    "{c.description}"
                  </p>
                </div>
              </div>

              {c.resolutionNotes && (
                <div className="p-6 bg-emerald-950/20 rounded-[2rem] text-sm text-emerald-400 border-2 border-emerald-500/20 shadow-inner animate-fade-in relative z-10">
                  <span className="font-black text-emerald-400 block mb-3 flex items-center gap-2 uppercase tracking-[0.2em]">
                    <CheckCircle2 className="w-5 h-5 text-accent-green" /> Support Team Response:
                  </span>
                  <p className="font-bold leading-relaxed">{c.resolutionNotes}</p>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-background-cardSecondary/40 rounded-[3rem] border-2 border-dashed border-border-primary/20">
           <div className="w-20 h-20 bg-background-dark rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/5">
              <ShieldCheck className="w-10 h-10 text-accent-green opacity-20" />
           </div>
           <p className="text-xs font-black text-text-muted uppercase tracking-[0.4em]">NO COMPLAINTS FOUND HERE.</p>
        </div>
      )}

      {/* Action Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={`Update Complaint: ${selectedComplaint?.subject}`}
        >
          <form onSubmit={handleUpdateStatus} className="space-y-10 pt-6">
            <div className="bg-background-dark/50 p-8 rounded-[2.5rem] border border-white/5 shadow-inner space-y-8">
              <div>
                <label className="text-[10px] font-black text-accent-light uppercase tracking-[0.4em] block mb-4 ml-2">STATUS</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-background-card border-2 border-border-primary/40 rounded-2xl p-4 text-xs font-black text-white focus:outline-none focus:border-accent-main shadow-2xl uppercase tracking-widest"
                >
                  <option value="in_review">Mark as Under Review</option>
                  <option value="resolved">Mark as Resolved</option>
                  <option value="rejected">Mark as Rejected</option>
                  <option value="open">Keep as New</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-accent-light uppercase tracking-[0.4em] block mb-4 ml-2">REPLY TO USER</label>
                <textarea
                  rows={5}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Tell the user how you are fixing this..."
                  className="w-full bg-background-card border-2 border-border-primary/40 rounded-[2rem] p-6 text-sm font-bold focus:outline-none focus:border-accent-main text-white shadow-2xl"
                  required
                />
              </div>
            </div>

            <PremiumButton type="submit" variant="gold" size="lg" fullWidth loading={updating} className="py-5 text-base shadow-orange font-black">
              SAVE UPDATE
            </PremiumButton>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default AdminComplaints;

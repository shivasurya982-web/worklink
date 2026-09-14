import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import Badge from '../../components/common/Badge';
import PremiumButton from '../../components/common/PremiumButton';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import { ShieldAlert, Trash2, CheckCircle, XCircle, Eye, RefreshCw, Filter, Users, AlertCircle, Download } from 'lucide-react';
import API from '../../services/api';

const AdminWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved, suspended, rejected
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const { showToast } = useNotification();

  useEffect(() => {
    fetchWorkers();
  }, [filterStatus]);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      let url = '/admin/workers';
      if (filterStatus !== 'all') {
        url += `?status=${filterStatus}`;
      }
      const res = await API.get(url);
      if (res && res.success) {
        // Handle both direct array and paginated data structure
        const data = res.data;
        if (Array.isArray(data)) {
          setWorkers(data);
        } else if (data && Array.isArray(data.workers)) {
          setWorkers(data.workers);
        } else if (data && typeof data === 'object') {
          setWorkers(Array.isArray(data) ? data : []);
        } else {
          setWorkers([]);
        }
      }
    } catch (err) {
      console.error('Fetch workers error:', err);
      showToast('Error', err.message || 'Failed to get workers list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveWorker = async (workerId) => {
    try {
      const res = await API.put(`/admin/workers/${workerId}/approve`);
      if (res && res.success) {
        showToast('Approved', 'Worker can now start working.', 'success');
        fetchWorkers();
        if (selectedWorker?._id === workerId) setSelectedWorker(null);
      }
    } catch (err) {
      showToast('Error', err.message || 'Failed to approve worker', 'error');
    }
  };

  const handleRejectWorker = async (workerId) => {
    const reason = prompt('Reason for rejection:') || 'Documents not clear';
    try {
      const res = await API.put(`/admin/workers/${workerId}/reject`, { reason });
      if (res && res.success) {
        showToast('Rejected', 'Worker has been notified.', 'info');
        fetchWorkers();
        if (selectedWorker?._id === workerId) setSelectedWorker(null);
      }
    } catch (err) {
      showToast('Error', err.message || 'Failed to reject worker', 'error');
    }
  };

  const handleToggleSuspendWorker = async (workerId, currentStatus) => {
    const isSuspended = currentStatus === 'suspended';
    const endpoint = isSuspended ? 'approve' : 'suspend';
    const reason = isSuspended ? '' : prompt('Reason for suspension:') || 'Rules violation';

    try {
      const res = await API.put(`/admin/workers/${workerId}/${endpoint}`, { reason });
      if (res && res.success) {
        showToast('Status Updated', `Worker is now ${isSuspended ? 'active' : 'suspended'}.`, 'success');
        fetchWorkers();
        if (selectedWorker?._id === workerId) setSelectedWorker(null);
      }
    } catch (err) {
      showToast('Error', err.message || 'Action failed', 'error');
    }
  };

  const handleDeleteWorker = async (workerId) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY DELETE this worker?')) return;

    try {
      const res = await API.delete(`/admin/workers/${workerId}`);
      if (res && res.success) {
        showToast('Deleted', 'Worker account removed forever.', 'info');
        setWorkers((prev) => prev.filter((w) => w._id !== workerId));
        if (selectedWorker?._id === workerId) setSelectedWorker(null);
      }
    } catch (err) {
      showToast('Error', err.message || 'Failed to delete worker', 'error');
    }
  };

  return (
    <DashboardLayout
      title="Manage Workers"
      subtitle="View, approve, and manage all service workers"
    >
      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-6 mb-10 flex-wrap">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
          {[
            { id: 'all', label: 'All Workers' },
            { id: 'pending', label: 'Pending Approval' },
            { id: 'approved', label: 'Approved' },
            { id: 'suspended', label: 'Suspended' },
            { id: 'rejected', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                filterStatus === tab.id
                  ? 'bg-accent-orange text-white shadow-xl'
                  : 'bg-background-cardSecondary text-text-muted hover:text-white border border-border-primary/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={fetchWorkers}
          className="p-3.5 rounded-2xl bg-background-widget border border-border-primary/20 hover:bg-background-secondary text-[10px] font-black text-white flex items-center gap-2.5 shrink-0 shadow-lg uppercase tracking-widest"
        >
          <RefreshCw className={`w-4 h-4 text-accent-bright ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Worker List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent-bright border-t-transparent shadow-orange" />
        </div>
      ) : workers.length > 0 ? (
        <div className="space-y-5">
          {workers.map((worker) => (
            <GlassCard key={worker._id} hover={false} className="p-6 sm:p-8 !bg-background-card border-border-primary/40 shadow-2xl group">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                {/* Info */}
                <div className="flex items-center gap-6">
                  <img
                    src={worker.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}&background=F4510B&color=fff`}
                    alt={worker.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] object-cover border-2 border-accent-main shadow-2xl group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="min-w-0">
                    <h4 className="font-sora font-black text-xl text-white flex items-center gap-3 uppercase tracking-tighter flex-wrap">
                      {worker.name}
                      <Badge
                        variant={
                          worker.approvalStatus === 'approved'
                            ? 'success'
                            : worker.approvalStatus === 'suspended'
                            ? 'danger'
                            : worker.approvalStatus === 'rejected'
                            ? 'danger'
                            : 'warning'
                        }
                        size="xs"
                        className="font-black uppercase"
                      >
                        {worker.approvalStatus}
                      </Badge>
                      {worker.isVerified && (
                        <Badge variant="verified" size="xs">
                          Verified
                        </Badge>
                      )}
                    </h4>
                    <div className="flex flex-wrap items-center gap-5 mt-3">
                      <p className="text-[10px] font-black text-accent-light uppercase tracking-widest bg-background-widget/40 px-3 py-1.5 rounded-lg border border-white/5">
                        {worker.profession}
                      </p>
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                        Exp: {worker.experience} Years
                      </p>
                    </div>
                    <p className="text-[10px] text-text-muted font-bold mt-3 opacity-60 uppercase tracking-tighter">
                      Email: {worker.email} | Phone: {worker.phone || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Control Action Buttons */}
                <div className="flex items-center gap-3 flex-wrap shrink-0 self-end lg:self-center">
                  <button
                    onClick={() => setSelectedWorker(worker)}
                    className="px-5 py-3 rounded-2xl bg-background-widget hover:bg-background-secondary text-[10px] font-black text-white flex items-center gap-2.5 uppercase tracking-widest shadow-xl border border-white/5"
                  >
                    <Eye className="w-4 h-4 text-accent-bright" /> View Details
                  </button>

                  {worker.approvalStatus === 'pending' && (
                    <>
                      <PremiumButton
                        variant="danger"
                        size="sm"
                        icon={XCircle}
                        onClick={() => handleRejectWorker(worker._id)}
                        className="!rounded-xl px-6"
                      >
                        Reject
                      </PremiumButton>
                      <PremiumButton
                        variant="gold"
                        size="sm"
                        icon={CheckCircle}
                        onClick={() => handleApproveWorker(worker._id)}
                        className="!rounded-xl px-8 shadow-orange"
                      >
                        Approve
                      </PremiumButton>
                    </>
                  )}

                  {worker.approvalStatus === 'approved' && (
                    <PremiumButton
                      variant="outline"
                      size="sm"
                      icon={ShieldAlert}
                      onClick={() => handleToggleSuspendWorker(worker._id, worker.approvalStatus)}
                      className="!rounded-xl px-6"
                    >
                      Suspend
                    </PremiumButton>
                  )}

                  {worker.approvalStatus === 'suspended' && (
                    <PremiumButton
                      variant="gold"
                      size="sm"
                      icon={CheckCircle}
                      onClick={() => handleToggleSuspendWorker(worker._id, worker.approvalStatus)}
                      className="!rounded-xl px-8 shadow-orange"
                    >
                      Activate
                    </PremiumButton>
                  )}

                  <PremiumButton
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDeleteWorker(worker._id)}
                    className="!rounded-xl px-6"
                  >
                    Delete
                  </PremiumButton>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-background-cardSecondary/40 rounded-[3rem] border-2 border-dashed border-border-primary/20">
           <div className="w-20 h-20 bg-background-dark rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/5">
              <Users className="w-10 h-10 text-accent-bright opacity-20" />
           </div>
           <p className="text-xs font-black text-text-muted uppercase tracking-[0.4em]">NO WORKERS FOUND IN THIS LIST.</p>
        </div>
      )}

      {/* Details Modal */}
      {selectedWorker && (
        <Modal
          isOpen={!!selectedWorker}
          onClose={() => setSelectedWorker(null)}
          title={`Worker Details: ${selectedWorker.name}`}
        >
          <div className="space-y-8 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-background-dark/50 rounded-[2rem] border border-white/5 shadow-inner">
              <div className="space-y-1"><p className="text-[9px] font-black text-accent-light uppercase tracking-widest">NAME</p><p className="text-sm font-bold text-white uppercase">{selectedWorker.name}</p></div>
              <div className="space-y-1"><p className="text-[9px] font-black text-accent-light uppercase tracking-widest">STATUS</p><p className="text-sm font-bold text-accent-bright uppercase">{selectedWorker.approvalStatus}</p></div>
              <div className="space-y-1"><p className="text-[9px] font-black text-accent-light uppercase tracking-widest">PROFESSION</p><p className="text-sm font-bold text-white uppercase">{selectedWorker.profession}</p></div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-accent-light uppercase tracking-widest">CATEGORY</p>
                <p className="text-sm font-bold text-white uppercase">
                  {selectedWorker.category?.name || "None"}
                </p>
              </div>
              <div className="space-y-1"><p className="text-[9px] font-black text-accent-light uppercase tracking-widest">EXPERIENCE</p><p className="text-sm font-bold text-white uppercase">{selectedWorker.experience} YEARS</p></div>
              <div className="space-y-1"><p className="text-[9px] font-black text-accent-light uppercase tracking-widest">PRICING</p><p className="text-sm font-bold text-accent-light uppercase">QUOTE-BASED</p></div>
              <div className="space-y-1"><p className="text-[9px] font-black text-accent-light uppercase tracking-widest">EMAIL</p><p className="text-sm font-bold text-white lowercase break-all">{selectedWorker.email}</p></div>
              <div className="space-y-1"><p className="text-[9px] font-black text-accent-light uppercase tracking-widest">PHONE</p><p className="text-sm font-bold text-white uppercase">{selectedWorker.phone}</p></div>
              <div className="space-y-1 sm:col-span-2">
                 <p className="text-[9px] font-black text-accent-light uppercase tracking-widest">ADDRESS</p>
                 <p className="text-sm font-bold text-white uppercase leading-relaxed">
                   {selectedWorker.address?.street}, {selectedWorker.address?.city}, {selectedWorker.address?.state} , PIN: {selectedWorker.address?.zip}
                 </p>
              </div>
            </div>

            {selectedWorker.description && (
              <div className="space-y-3">
                <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] block ml-2">Bio / Description:</span>
                <p className="p-6 bg-background-dark/30 rounded-[2rem] text-sm text-text-secondary leading-relaxed font-bold italic opacity-90 border border-white/5 shadow-inner">"{selectedWorker.description}"</p>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between mb-3 px-2">
                <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] block">Verification Document:</span>
                {selectedWorker.identityProof && (
                  <a
                    href={selectedWorker.identityProof}
                    download={`verification_${selectedWorker.name}.jpg`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] font-black text-accent-bright hover:text-white transition-colors flex items-center gap-1.5 uppercase tracking-widest"
                  >
                    <Download className="w-3.5 h-3.5" /> Download ID
                  </a>
                )}
              </div>
              {selectedWorker.identityProof ? (
                <div className="relative group rounded-[2.5rem] overflow-hidden border-2 border-border-primary/30 shadow-2xl bg-background-dark p-2">
                   <img
                    src={selectedWorker.identityProof.startsWith('http') ? selectedWorker.identityProof : selectedWorker.identityProof}
                    alt="ID Proof"
                    className="max-h-80 w-full object-contain rounded-[2rem] transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      if (!e.target.src.includes('placehold.co')) {
                        e.target.src = `https://placehold.co/600x400/080808/F4510B?text=IMAGE+ERROR`;
                      }
                    }}
                   />
                   <div className="absolute inset-0 bg-accent-orange/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              ) : (
                <div className="p-10 bg-background-dark/30 rounded-[2.5rem] border-2 border-dashed border-white/5 text-center">
                   <AlertCircle className="w-10 h-10 text-accent-orange mx-auto mb-4 opacity-40" />
                   <p className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-relaxed">No verification image recorded in database.<br/>Worker may need to re-register.</p>
                </div>
              )}
            </div>

            <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-4">
              {selectedWorker.approvalStatus === 'pending' && (
                <>
                  <PremiumButton variant="danger" size="lg" fullWidth onClick={() => handleRejectWorker(selectedWorker._id)} className="py-4 font-black">
                    REJECT
                  </PremiumButton>
                  <PremiumButton variant="gold" size="lg" fullWidth onClick={() => handleApproveWorker(selectedWorker._id)} className="py-4 shadow-orange font-black">
                    APPROVE
                  </PremiumButton>
                </>
              )}
              <PremiumButton variant="danger" size="lg" fullWidth onClick={() => handleDeleteWorker(selectedWorker._id)} className="py-4 font-black">
                DELETE ACCOUNT
              </PremiumButton>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default AdminWorkers;
